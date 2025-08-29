// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { useRef } from "react";
import { TimeoutId } from "./TimeoutId.js";

export function useTimeout(
  callback: () => void,
  debounceDelayMilliseconds: number = 500,
  timeoutRef = useRef<TimeoutId>(undefined),
) {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);

  timeoutRef.current = setTimeout(() => {
    callback();
    timeoutRef.current = undefined;
  }, debounceDelayMilliseconds);

  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      callback();
    }
  };
}
