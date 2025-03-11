import { assert, randInt } from "@dwidge/utils-js";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Async Semaphore Hook

export interface AsyncSemaphoreResult<R> {
  id: number;
  isRunning: boolean;
  lastResult?: R;
  lastError?: Error;
  execute?: (asyncFn: (signal: AbortSignal) => Promise<R>) => Promise<R>;
  abort?: () => void;
  reset: () => void;
}

export const useAsyncSemaphore = <R,>(): AsyncSemaphoreResult<R> => {
  const [id] = useState<number>(() => randInt());
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<R | undefined>(undefined);
  const [lastError, setLastError] = useState<Error | undefined>(undefined);
  const currentPromiseRef = useRef<Promise<R> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (asyncFn: (signal: AbortSignal) => Promise<R>): Promise<R> => {
      // console.log("execute1", id);

      assert(
        currentPromiseRef.current === null,
        "executeSemaphoreE21: currentPromiseRef should be null before executing",
      );
      assert(
        abortControllerRef.current === null,
        "executeSemaphoreE22: abortControllerRef should be null before executing",
      );

      setIsRunning(true);
      abortControllerRef.current = new AbortController();
      currentPromiseRef.current = asyncFn(abortControllerRef.current.signal);

      assert(
        currentPromiseRef.current != null,
        "executeSemaphoreE31: currentPromiseRef should be set after executing asyncFn",
      );
      assert(
        abortControllerRef.current != null,
        "executeSemaphoreE32: abortControllerRef should be set after executing asyncFn",
      );

      try {
        const result = await currentPromiseRef.current;
        setLastError(undefined);
        setLastResult(result);
        return result;
      } catch (error) {
        setLastResult(undefined);
        setLastError(error instanceof Error ? error : new Error(String(error)));
        // console.log("catch1", id, error);
        throw error;
      } finally {
        setIsRunning(false);

        assert(
          currentPromiseRef.current != null,
          "executeSemaphoreE41: currentPromiseRef should not be null before setting to null in finally",
        );
        assert(
          abortControllerRef.current != null,
          "executeSemaphoreE42: abortControllerRef should not be null before setting to null in finally",
        );

        currentPromiseRef.current = null;
        abortControllerRef.current = null;
      }
    },
    [],
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const reset = useCallback(async () => {
    abort();
    await new Promise((res) => setTimeout(res, 0));
    setIsRunning(false);
    setLastResult(undefined);
    setLastError(undefined);
    currentPromiseRef.current = null;
    abortControllerRef.current = null;
  }, []);

  useEffect(() => abort, [abort]);

  return {
    id,
    isRunning,
    lastResult,
    lastError,
    execute: isRunning ? undefined : execute,
    abort: isRunning ? abort : undefined,
    reset,
  };
};

// Async Interval Hook

export interface AsyncIntervalResult<A, R> {
  id: number;
  lastRunTime: Date | null;
  lastResult?: R;
  lastError?: Error;
  isRunning: boolean;
  trigger?: (arg: A) => Promise<R>;
  abort?: () => void;
  intervalSeconds: number;
  reset: () => void;
}

type TimeoutId = ReturnType<typeof setTimeout>;

export const useAsyncInterval = <
  A,
  R,
  T extends ((signal: AbortSignal, arg: A) => Promise<R>) | undefined,
>(
  intervalSeconds: number,
  asyncFn: T,
  defaultArg: A,
  enable: boolean = true,
  semaphore: AsyncSemaphoreResult<R> = useAsyncSemaphore<R>(),
): AsyncIntervalResult<A, R> => {
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const timeoutIdRef = useRef<TimeoutId | null>(null);
  const {
    id,
    isRunning,
    execute,
    abort,
    lastResult,
    lastError,
    reset: resetSemaphore,
  } = semaphore;

  const executeAsyncFn = useMemo(
    () =>
      execute && asyncFn
        ? async (arg: A): Promise<R> =>
            execute((s) =>
              asyncFn(s, arg).finally(() => setLastRunTime(new Date())),
            )
        : undefined,
    [asyncFn, execute, id],
  );

  const scheduleNextRun = useCallback(() => {
    if (!executeAsyncFn) return;
    if (!enable) return;

    assert(
      timeoutIdRef.current === null,
      "scheduleNextRunE1: timeoutIdRef should be null when not isRunning",
    );

    if (intervalSeconds <= 0) return;

    let delayMs = intervalSeconds * 1000;
    const elapsedMs = lastRunTime ? Date.now() - lastRunTime.getTime() : null;
    const timeoutMs = elapsedMs === null ? 0 : Math.max(0, delayMs - elapsedMs);

    // console.log("setTimeout1", id);
    timeoutIdRef.current = setTimeout(
      () => executeAsyncFn(defaultArg),
      timeoutMs,
    );
    assert(
      timeoutIdRef.current != null,
      "scheduleNextRunE4: timeoutIdRef should be set when scheduling",
    );

    return () => {
      assert(
        timeoutIdRef.current != null,
        "scheduleNextRunE5: timeoutIdRef should be set when cleanup",
      );
      // console.log("clearTimeout1", id);

      clearTimeout(timeoutIdRef.current as TimeoutId);
      timeoutIdRef.current = null;
    };
  }, [intervalSeconds, executeAsyncFn, defaultArg, lastRunTime, enable]);

  useEffect(scheduleNextRun, [scheduleNextRun]);

  // Reset function for AsyncInterval, includes resetting AsyncSemaphore and interval specific states
  const reset = useCallback(() => {
    resetSemaphore();
    setLastRunTime(null);
    // This setLastRunTime will cause lastRunTime to change, which calls scheduleNextRun cleanup.
    // Ensure enable is false before you reset, if you dont want it run again straight after reset.
  }, [resetSemaphore]);

  const context = useMemo<AsyncIntervalResult<A, R>>(() => {
    return {
      id,
      lastRunTime,
      lastResult,
      lastError,
      isRunning,
      trigger: executeAsyncFn,
      abort: abort,
      intervalSeconds,
      reset,
    };
  }, [
    id,
    lastRunTime,
    lastResult,
    lastError,
    isRunning,
    executeAsyncFn,
    abort,
    intervalSeconds,
    reset,
  ]);

  useEffect(() => {
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
        new Error(
          "useAsyncIntervalE3: lastResult must be undefined when lastError is defined",
          {
            cause: {
              lastError: context.lastError,
              lastResult: context.lastResult,
            },
          },
        ),
      );
    } else if (context.lastResult !== undefined) {
      assert(
        context.lastError === undefined,
        new Error(
          "useAsyncIntervalE4: lastError must be undefined when lastResult is defined",
          {
            cause: {
              lastError: context.lastError,
              lastResult: context.lastResult,
            },
          },
        ),
      );
    }
  }, [context]);

  useEffect(() => {
    if (!enable && isRunning) {
      abort?.();
    }
  }, [enable, isRunning, abort]);

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
  const [intervalEnabled, setIntervalEnabled] = useState(true);
  const {
    lastRunTime,
    lastResult,
    lastError,
    trigger,
    isRunning,
    abort,
    intervalSeconds,
    reset,
  } = useAsyncInterval(
    3,
    exampleAsyncFunction,
    {
      source: "interval",
    },
    intervalEnabled,
  );

  const handleManualTrigger = useCallback(async () => {
    if (trigger) {
      // Check if trigger is defined before calling
      const resultPromise = trigger({ source: "manual" });
      if (resultPromise) {
        try {
          const result = await resultPromise;
          console.log("Manual trigger result:", result); // Log the result
        } catch (error) {
          console.error("Manual trigger error:", error); // Log the error
        }
      }
    }
  }, [trigger]);

  const handleAbort = useCallback(() => {
    abort?.(); // Optional chaining as abort might be undefined
    console.log("Manually aborted");
  }, [abort]);

  const toggleInterval = useCallback(() => {
    setIntervalEnabled(!intervalEnabled);
  }, [intervalEnabled]);

  // Handler to reset the interval hook
  const handleReset = useCallback(() => {
    reset();
    console.log("Interval reset");
  }, [reset]);

  return (
    <StyledView>
      <StyledText>Interval Seconds: {intervalSeconds}</StyledText>
      <StyledText>
        Last run time: {lastRunTime?.toLocaleTimeString() || "Never"}
      </StyledText>
      {trigger && (
        <StyledButton onPress={handleManualTrigger}>Trigger</StyledButton>
      )}
      {abort && <StyledButton onPress={handleAbort}>Abort</StyledButton>}
      <StyledButton onPress={toggleInterval}>
        {intervalEnabled ? "Disable Interval" : "Enable Interval"}
      </StyledButton>
      <StyledButton onPress={handleReset}>Reset</StyledButton>
      <StyledText>Is running: {isRunning ? "Yes" : "No"}</StyledText>
      <StyledText>
        Last result: {String(lastResult) || "No result yet"}
      </StyledText>
      <StyledText>Last error: {lastError?.message || "No error"}</StyledText>
    </StyledView>
  );
};

export const AsyncIntervalDemo: React.FC = () => {
  return <ExampleConsumer />;
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
