import { assert } from "@dwidge/utils-js";
import { useCallback, useMemo } from "react";
import { AsyncState } from "./State.js";
import { useDerivedState } from "./useDerivedState.js";

/**
 * A hook that takes an `AsyncState` with a nullable value and returns a new `AsyncState`
 * with a non-nullable value. It throws an error if the original value is `null`,
 * providing a guarantee to downstream consumers that the value is not `null`.
 *
 * @template T The non-nullable type of the state value.
 * @param state The `AsyncState<T | null>` tuple.
 * @returns An `AsyncState<T>` tuple.
 * @throws {Error} if the value in the input `state` is `null`.
 */
export function useNonNullable<T>(state: AsyncState<T | null>): AsyncState<T> {
  const toDerived = useCallback((original: T | null) => {
    assert(original !== null, "Value is null");
    return original!;
  }, []);
  const toOriginal = useCallback((derived: T): T | null => derived, []);
  const useDerived = useMemo(
    () => useDerivedState<T, T | null>(toDerived, toOriginal),
    [toDerived, toOriginal],
  );
  return useDerived(state);
}
