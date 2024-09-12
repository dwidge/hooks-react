// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { useEffect, useRef, useState } from "react";
import { BufferedState, State } from "./State.js";
import { TimeoutId } from "./TimeoutId.js";

export function useSaveOnExitState<T>(
  [value, setValue]: State<T>,
  delayMs = 1000
): BufferedState<T> {
  const [state, setState] = useState(value);
  const s = useRef(value);
  const setValueR = useRef(setValue);
  const t = useRef<TimeoutId>();

  const setDelayed = (v: (prev: T) => T) => {
    s.current = v(s.current);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => {
      t.current = undefined;
      setState(s.current);
    }, delayMs);
  };

  useEffect(() => {
    if (value !== s.current) setDelayed(() => value);
  }, [value]);

  useEffect(() => {
    setValueR.current = setValue;
  }, [setValue]);

  useEffect(
    () => () => {
      if (value !== s.current) setValueR.current?.(s.current);
    },
    []
  );

  return [state, setDelayed];
}
