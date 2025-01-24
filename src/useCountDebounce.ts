import { useState, useCallback, useRef, useEffect } from "react";

interface UseCountDebounceOptions<
  T extends (...args: any[]) => void | Promise<void>,
> {
  countThreshold: number;
  onThresholdReached: T;
  resetDelay?: number;
}

type TimeoutId = ReturnType<typeof setTimeout>;

/**
 * A hook that triggers a callback after a certain number of calls
 * within a time window, effectively debouncing the count.
 */
export const useCountDebounce = <
  T extends (...args: any[]) => void | Promise<void>,
>({
  countThreshold,
  onThresholdReached,
  resetDelay = 300,
}: UseCountDebounceOptions<T>): (() => ReturnType<T> | void) => {
  const [currentCount, setCurrentCount] = useState(0);
  const timeoutRef = useRef<TimeoutId | null>(null);

  const resetCount = useCallback(() => {
    setCurrentCount(0);
  }, []);

  const trigger = useCallback((): ReturnType<T> | void => {
    setCurrentCount((prevCount) => prevCount + 1);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(resetCount, resetDelay);

    if (currentCount + 1 === countThreshold) {
      return onThresholdReached() as ReturnType<T>;
    }
  }, [
    resetDelay,
    resetCount,
    countThreshold,
    onThresholdReached,
    currentCount,
  ]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return trigger;
};
