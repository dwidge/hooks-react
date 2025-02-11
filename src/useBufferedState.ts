// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { useEffect, useState } from "react";
import { BufferedState, State } from "./State.js";

export function useBufferedState<T>([
  value,
  setValue,
]: State<T>): BufferedState<T> {
  const [state, setState] = useState(value);

  useEffect(() => {
    if (value !== state) setState(value);
  }, [value]);
  useEffect(() => {
    if (value !== state) setValue?.(state);
  }, [state]);

  return [state, setState];
}
