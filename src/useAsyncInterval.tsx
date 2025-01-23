import { assert } from "@dwidge/utils-js";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
  useMemo,
} from "react";

interface AsyncIntervalContextValue<A, R> {
  lastRunTime: Date | null;
  lastResult?: R;
  lastError?: Error;
  isRunning: boolean;
  trigger?: (arg: A) => Promise<R>;
  abort?: () => void;
  intervalSeconds: number;
}

const AsyncIntervalContext = createContext<
  AsyncIntervalContextValue<any, any> | undefined
>(undefined);

interface AsyncIntervalProviderProps<
  A,
  R,
  T extends (signal: AbortSignal, arg: A) => Promise<R>,
> {
  intervalSeconds: number;
  asyncFn: T;
  children: React.ReactNode;
  defaultArg: A;
}

type TimeoutId = ReturnType<typeof setTimeout>;

export const AsyncIntervalProvider = <
  A,
  R,
  T extends (signal: AbortSignal, arg: A) => Promise<R>,
>({
  intervalSeconds,
  asyncFn,
  children,
  defaultArg,
}: AsyncIntervalProviderProps<A, R, T>) => {
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const [lastResult, setLastResult] = useState<R | undefined>(undefined);
  const [lastError, setLastError] = useState<Error | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);
  const currentPromiseRef = useRef<Promise<R> | null>(null);
  const timeoutIdRef = useRef<TimeoutId | null>(null);
  const lastRunTimeRef = useRef<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeAsyncFn = useCallback(
    async (arg: A): Promise<R> => {
      assert(
        !isRunning,
        "executeAsyncFnE1: Should not be called when isRunning is true",
      );
      setIsRunning(true);
      assert(
        currentPromiseRef.current === null,
        "executeAsyncFnE2: currentPromiseRef should be null before executing",
      );

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      currentPromiseRef.current = asyncFn(signal, arg);

      assert(
        currentPromiseRef.current != null,
        "executeAsyncFnE3: currentPromiseRef should be set after executing asyncFn",
      );
      try {
        const result = await currentPromiseRef.current;
        setLastResult(result);
        setLastError(undefined);
        return result;
      } catch (error) {
        setLastError(error instanceof Error ? error : new Error(String(error)));
        setLastResult(undefined);
        throw error;
      } finally {
        const now = new Date();
        lastRunTimeRef.current = now;
        setLastRunTime(now);
        setIsRunning(false);
        assert(
          currentPromiseRef.current != null,
          "executeAsyncFnE4: currentPromiseRef should not be null before setting to null in finally",
        );
        currentPromiseRef.current = null;
        abortControllerRef.current = null;
        assert(
          timeoutIdRef.current == null || intervalSeconds <= 0,
          "executeAsyncFnE5: Timeout should be cleared or not set if interval is <= 0 after execution",
        );
      }
    },
    [asyncFn, isRunning, intervalSeconds],
  );

  const scheduleNextRun = useCallback(() => {
    if (isRunning) return;
    if (!intervalSeconds) return;

    assert(
      timeoutIdRef.current === null,
      "scheduleNextRunE1: Timeout should be null on initial schedule",
    );
    assert(
      !currentPromiseRef.current,
      "scheduleNextRunE2: scheduleNextRun should not be called when currentPromiseRef is set",
    );
    assert(
      !abortControllerRef.current,
      "scheduleNextRunE3: scheduleNextRun should not be called when abortControllerRef is set",
    );
    if (intervalSeconds > 0) {
      timeoutIdRef.current = setTimeout(
        () => executeAsyncFn(defaultArg),
        intervalSeconds * 1000,
      );
      assert(
        timeoutIdRef.current != null,
        "scheduleNextRunE4: Timeout ID should be set when scheduling",
      );
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [intervalSeconds, executeAsyncFn, defaultArg, isRunning]);

  const trigger = executeAsyncFn;

  const abort = useCallback(() => {
    if (isRunning && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [isRunning]);

  useEffect(scheduleNextRun, [scheduleNextRun]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const contextValue = useMemo<AsyncIntervalContextValue<A, R>>(() => {
    return {
      lastRunTime,
      lastResult,
      lastError,
      isRunning,
      trigger: !isRunning ? trigger : undefined,
      abort: isRunning ? abort : undefined,
      intervalSeconds,
    };
  }, [
    lastRunTime,
    lastResult,
    lastError,
    isRunning,
    trigger,
    abort,
    intervalSeconds,
  ]);

  return (
    <AsyncIntervalContext.Provider value={contextValue}>
      {children}
    </AsyncIntervalContext.Provider>
  );
};

export const useAsyncInterval = <A, R>(): AsyncIntervalContextValue<A, R> => {
  const context = useContext(AsyncIntervalContext);
  if (!context) {
    throw new Error(
      "useAsyncIntervalE1: Must be used within an AsyncIntervalProvider",
    );
  }
  if (context.isRunning) {
    assert(
      context.trigger === undefined,
      "useAsyncIntervalE2: Trigger must not be defined while running",
    );
    assert(
      context.abort !== undefined,
      "useAsyncIntervalE5: Abort must be defined while running",
    );
  } else {
    assert(
      context.abort === undefined,
      "useAsyncIntervalE6: Abort must be undefined when not running",
    );
  }
  if (context.lastError !== undefined) {
    assert(
      context.lastResult === undefined,
      "useAsyncIntervalE3: lastResult must be undefined when lastError is defined",
    );
  } else if (context.lastResult !== undefined) {
    assert(
      context.lastError === undefined,
      "useAsyncIntervalE4: lastError must be undefined when lastResult is defined",
    );
  }
  return context;
};

// Example usage

interface FetchDataArg {
  source: string;
}

type FetchDataResult = string;

const exampleAsyncFunction = async (
  signal: AbortSignal,
  arg: FetchDataArg,
): Promise<FetchDataResult> => {
  // Updated signature with return type
  const source = arg?.source || "default";
  console.log(`Fetching data from ${source}...`);
  return await new Promise<FetchDataResult>((resolve, reject) => {
    // Promise resolves with FetchDataResult
    const timeoutId = setTimeout(() => {
      const result = `Data fetched successfully from ${source}`;
      console.log(`Data fetched from ${source}!`);
      resolve(result); // Resolve with FetchDataResult
    }, 500);

    signal?.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new Error("AbortError"));
      console.log(`Fetch from ${source} aborted!`);
    });
  });
};

const ExampleConsumer: React.FC = () => {
  const { lastRunTime, lastResult, lastError, trigger, isRunning, abort } =
    useAsyncInterval<FetchDataArg, FetchDataResult>();

  const handleManualTrigger = useCallback(async () => {
    const resultPromise = trigger?.({ source: "manual" });
    if (resultPromise) {
      try {
        const result = await resultPromise;
        console.log("Manual trigger result:", result); // Log the result
      } catch (error) {
        console.error("Manual trigger error:", error); // Log the error
      }
    }
  }, [trigger]);

  const handleAbort = useCallback(() => {
    abort?.();
    console.log("Manually aborted");
  }, [abort]);

  return (
    <StyledView>
      <StyledText>
        Last run time: {lastRunTime?.toLocaleTimeString() || "Never"}
      </StyledText>
      {trigger && (
        <StyledButton onPress={handleManualTrigger}>Trigger</StyledButton>
      )}
      {abort && <StyledButton onPress={handleAbort}>Abort</StyledButton>}
      <StyledText>Is running: {isRunning ? "Yes" : "No"}</StyledText>
      <StyledText>Last result: {lastResult || "No result yet"}</StyledText>
      <StyledText>Last error: {lastError?.message || "No error"}</StyledText>
    </StyledView>
  );
};

export const AsyncIntervalDemo: React.FC = () => {
  return (
    <AsyncIntervalProvider
      intervalSeconds={3}
      asyncFn={exampleAsyncFunction}
      defaultArg={{ source: "interval" }}
    >
      <ExampleConsumer />
    </AsyncIntervalProvider>
  );
};

const StyledView = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);
const StyledText = ({ children }: { children: React.ReactNode }) => (
  <p>{children}</p>
);
const StyledButton = ({
  onPress,
  children,
}: {
  onPress?: () => void;
  children: React.ReactNode;
}) => <button onClick={onPress}>{children}</button>;
