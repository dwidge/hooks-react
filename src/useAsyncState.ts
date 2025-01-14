import { useState } from "react";
import { AsyncState } from "./State.js";

export function useAsyncState<T>(initialState: T | (() => T)): AsyncState<T> {
  const [state, setState] = useState<T>(initialState);

  return [
    state,
    async (
      getValue,
      value = typeof getValue === "function"
        ? (getValue as (prevState: T) => T)(state)
        : getValue,
    ) => (setState(value), value),
  ];
}
