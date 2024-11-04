// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Dispatch, useRef, useEffect } from "react";
import { TimeoutId } from "./TimeoutId.js";

export function useDelayedCallback<T>(
  setValue?: Dispatch<T>,
  delay: number = 5000,
  debug = ""
): Dispatch<T> | undefined {
  const timerRef = useRef<TimeoutId>();
  const stateRef = useRef<T>();

  useEffect(
    () => () => {
      debug && console.log("useDelayedCallback1", debug);
      if (timerRef.current) {
        debug && console.log("useDelayedCallback2", debug);
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
        if (stateRef.current !== undefined) {
          debug &&
            console.log(
              "useDelayedCallback3",
              debug,
              !!setValue,
              stateRef.current
            );
          setValue?.(stateRef.current);
          stateRef.current = undefined;
        }
      }
    },
    [setValue, debug]
  );

  return setValue
    ? (newValue: T) => {
        if (delay && delay < 100)
          console.warn("useDelayedCallbackW1: delay is milliseconds");

        if (timerRef.current) clearTimeout(timerRef.current);

        stateRef.current = newValue;
        timerRef.current = setTimeout(() => {
          timerRef.current = undefined;
          if (stateRef.current !== undefined) {
            setValue?.(stateRef.current);
            stateRef.current = undefined;
          }
        }, delay);
      }
    : undefined;
}
