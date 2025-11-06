import { useMemo } from "react";
import { setField } from "./setField.js";
import { AsyncState } from "./State.js";

/**
 * A hook that provides an `AsyncState` for a specific field of an object's state.
 * It combines the value of a field with a setter that updates only that field in the parent state object.
 *
 * @template T The type of the parent state object.
 * @template K The key of the field within the parent state object.
 * @param {[value, setValue]} state The `AsyncState` tuple for the parent object.
 * @param {K} key The key of the field to create a state for.
 * @param {T[K]} init The initial/default value for the field, used if the parent state update resolves to a value without the key.
 * @returns {AsyncState<T[K]>} An `AsyncState` tuple for the specified field.
 */
export const useField = <T extends object, K extends keyof T>(
  [value, setValue]: AsyncState<T>,
  key: K,
  init: T[K],
): AsyncState<T[K]> => {
  const fieldValue = value?.[key];
  const setFieldValue = useMemo(
    () => (setValue ? setField(setValue, key, init) : undefined),
    [setValue, key, init],
  );

  return [fieldValue, setFieldValue];
};
