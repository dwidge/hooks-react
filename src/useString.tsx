import { assert } from "@dwidge/utils-js";
import { useDerivedState } from "./useDerivedState";

/**
 * A hook that takes a `useState` tuple for a string and returns a new tuple
 * where the setter function trims the string before passing it to the original setter.
 *
 * @param stateTuple The `[value, setValue]` tuple for a string state.
 * @param trim A boolean indicating whether to trim the string.
 * @returns A `[value, setTrimmedValue]` tuple, where `value` is the original value
 *          and `setTrimmedValue` is the new setter with trimming logic.
 */
export const useStringTrim = useDerivedState<string>(
  (v) => v,
  (v) => v.trim(),
);

export const useStringNull = useDerivedState<string, string | null>(
  (v) => v || "",
  (v) => v || null,
);

export const useStringNumberNull = useDerivedState<
  string | null,
  number | null
>(
  (t) => (t === null ? "" : "" + t),
  (r) => (assert(!isNaN(Number(r)), "Not a number"), Number(r)),
);

export const useStringNumber = useDerivedState<string, number>(
  (t) => "" + t,
  (r) => (assert(!isNaN(Number(r)), "Not a number"), Number(r)),
);
