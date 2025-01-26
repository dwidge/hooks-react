import { useRef, useState, useEffect } from "react";

/**
 * Deeply compares two values to determine if they are equal.
 * Handles objects, arrays, and primitive types.
 *
 * @param a The first value.
 * @param b The second value.
 * @returns True if the values are deeply equal, false otherwise.
 */
function deepCompare(a: any, b: any): boolean {
  if (a === b) {
    return true; // Strict equality (primitive values, same references)
  }

  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false; // Different types or one is null/primitive
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepCompare(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!b.hasOwnProperty(key) || !deepCompare(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  return false; // Fallback for other cases (shouldn't usually reach here for common objects/arrays)
}

/**
 * A React hook that deep memoizes a value. It returns the memoized value,
 * updating it only when the value deeply changes based on deep comparison.
 *
 * @param value The value to memoize (can be any complex JavaScript object/array).
 * @returns The memoized value.
 */
export function useDeepMemo<T>(value: T): T {
  const [memoizedValue, setMemoizedValue] = useState<T>(value);
  const previousValueRef = useRef<T>(value);

  useEffect(() => {
    if (!deepCompare(value, previousValueRef.current)) {
      setMemoizedValue(value);
    }
    previousValueRef.current = value;
  }, [value]); // We intentionally use the value itself as a dependency

  return memoizedValue;
}
