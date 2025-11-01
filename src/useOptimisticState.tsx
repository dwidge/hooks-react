import { startTransition, useMemo, useOptimistic } from "react";
import { AsyncDispatch, AsyncState, getActionValue } from "./State";

/**
 * A hook that combines `useOptimistic` and `startTransition` with a `useState` tuple.
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
        ? (action) =>
            new Promise<T>((resolve) => {
              startTransition(async () => {
                const resolvedValue = await getActionValue(
                  action,
                  value ?? init,
                );
                setOptimisticInternal(resolvedValue);
                resolve(await setValue(resolvedValue));
              });
            })
        : undefined,
    [value, setValue, startTransition],
  );

  return [optimisticValue, setOptimisticAndUpstream];
}
