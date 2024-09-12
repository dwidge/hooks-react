// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Dispatch, useEffect, useState } from "react";
import { useDelayedCallback } from "./useDelayedCallback.js";

export const useDelayedState = <T,>(
  [value, setValue]: readonly [T?, Dispatch<T>?],
  delay?: number,
  debug = ""
): [T?, Dispatch<T>?] => {
  const setDelayed = useDelayedCallback(setValue, delay, debug);

  const [state, setState] = useState(value);

  useEffect(() => {
    debug && console.log("setState0", debug);
    if (value !== state) {
      debug && console.log("setState1", debug, value);
      setState(value);
    }
  }, [value]);
  useEffect(() => {
    debug && console.log("setDelayed0", debug);
    if (value !== state && state !== undefined) {
      debug && console.log("setDelayed1", debug, state);
      setDelayed?.(state);
    }
  }, [state]);

  return [state, setState];
};
