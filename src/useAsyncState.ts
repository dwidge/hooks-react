import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AsyncDispatch, AsyncState } from "./State.js";

export function useAsyncState<T>(initialState: T | (() => T)): AsyncState<T> {
  const [state, setState] = useState<T>(initialState);
  const stateRef = useRef<T>(state);
  stateRef.current = state; // Keep the ref updated with the latest state

  const asyncDispatch: AsyncDispatch<T> = useCallback(
    async (action) => {
      const newState: T = await (typeof action === "function"
        ? (action as (prevState: T) => T | Promise<T>)(stateRef.current)
        : action);
      setState(newState);
      return newState;
    },
    [setState],
  );

  return useMemo(() => [state, asyncDispatch], [state, asyncDispatch]);
}

// Todo: Error checking
const useAsyncState2 = <T>(initialValue: T): AsyncState<T> => {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const dispatch: AsyncDispatch<T> = useCallback(
    async (action) => {
      if (!isMounted.current) {
        return Promise.reject(
          new Error("Dispatch called after component unmounted"),
        );
      }

      setValue(undefined); // Set to undefined immediately to indicate loading

      let nextValue: T | Promise<T>;
      if (typeof action === "function") {
        if (value === undefined) {
          // Should not happen in normal cases, but for safety, resolve to initial value if current value is somehow undefined during function update
          nextValue = (action as (prevState: T) => T | Promise<T>)(
            initialValue,
          );
        } else {
          nextValue = (action as (prevState: T) => T | Promise<T>)(value as T);
        }
      } else {
        nextValue = action;
      }

      try {
        const resolvedValue = await Promise.resolve(nextValue);
        if (isMounted.current) {
          setValue(resolvedValue);
        }
        return resolvedValue;
      } catch (error) {
        if (isMounted.current) {
          setValue(initialValue); // Revert to initial value or previous valid value on error? or undefined? let's revert to initial for now.
        }
        throw error; // rethrow error for the caller to handle if needed
      }
    },
    [setValue, initialValue, value],
  );

  return [value, dispatch];
};
