import { useRef, useState, useEffect } from "react";
import { deepCompare } from "./deepCompare.js";

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
