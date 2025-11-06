import { assert } from "@dwidge/utils-js";
import { useCallback, useMemo } from "react";
import { AsyncState } from "./State.js";
import { useDerivedState } from "./useDerivedState.js";

/**
 * A hook that takes an `AsyncState` with a nullable value and returns a new `AsyncState`
 * with a non-nullable value.
 *
 * If an `init` value is provided, and the original state value is `null`, the `init` value
 * will be used instead of throwing an error. If no `init` value is provided and the original
 * value is `null`, it throws an error, providing a guarantee to downstream consumers that the
 * value is not `null`.
 *
 * @template T The non-nullable type of the state value.
 * @param state The `AsyncState<T | null>` tuple.
 * @param init An optional initial value to use if the original state value is `null`.
 *             If not provided, a `null` original value will throw an error.
 * @returns An `AsyncState<T>` tuple.
 * @throws {Error} if the value in the input `state` is `null` and no `init` value is provided.
 */
export function useNonNullable<T>(
  state: AsyncState<T | null>,
  init?: T,
): AsyncState<T> {
  const toDerived = useCallback(
    (original: T | null) => {
      if (init !== undefined && original === null) {
        return init;
      }
      assert(original !== null, "Value is null");
      return original!;
    },
    [init],
  );
  const toOriginal = useCallback((derived: T): T | null => derived, []);
  const useDerived = useMemo(
    () => useDerivedState<T, T | null>(toDerived, toOriginal),
    [toDerived, toOriginal],
  );
  return useDerived(state);
}
