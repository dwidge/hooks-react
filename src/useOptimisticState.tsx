import { useMemo, useOptimistic } from "react";
import { AsyncDispatch, AsyncState, getActionValue } from "./State";

/**
 * A hook that combines `useOptimistic` with a `useState` tuple.
 * It provides an optimistic value and a setter that updates both the optimistic state
 * and the actual state from the provided tuple.
 *
 * @param stateTuple The `[value, setValue]` tuple from a `useState` or similar hook.
 * @returns A `[optimisticValue, setOptimisticAndUpstream]` tuple.
 */
export function useOptimisticState<T>(
  [value, setValue]: AsyncState<T>,
  init: T,
): AsyncState<T> {
  const [optimisticValue, setOptimisticInternal] = useOptimistic(
    value,
    (currentOptimisticState, action: React.SetStateAction<T>) => {
      return typeof action === "function"
        ? (action as (prevState: T) => T)(currentOptimisticState ?? init)
        : action;
    },
  );

  const setOptimisticAndUpstream: AsyncDispatch<T> | undefined = useMemo(
    () =>
      setValue
        ? async (action) => {
            const resolvedValue = await getActionValue(action, value ?? init);
            setOptimisticInternal(resolvedValue);
            return setValue(resolvedValue);
          }
        : undefined,
    [value, setValue],
  );

  return [optimisticValue, setOptimisticAndUpstream];
}
