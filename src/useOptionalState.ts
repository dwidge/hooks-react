// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { useState } from "react";
import { OptionalState } from "./State.js";
import { useOptionalMemoState } from "./useMemoState.js";

/**
 * A useState React hook with an optional setter.
 *
 * @template T - The type of the state.
 * @param {T} initialState - The initial state value.
 * @returns {OptionalState<T>} A tuple containing the current state and an optional setter function.
 */
export const useOptionalState = <T>(initialState: T) =>
  useOptionalMemoState(useState<T>(initialState) as OptionalState<T>);

// export const useOptionalState2 = <T>(
//   initialState: T,
//   [v, setV] = useState<T>(initialState),
// ) =>
//   useMemoState([
//     v,
//     (prev) => {
//       let vv: T = v;
//       setV((prev2) => {
//         vv = typeof prev === "function" ? (prev as (v: T) => T)(prev2) : prev;
//         return vv;
//       });
//       return vv;
//     },
//   ] as OptionalState<T>);
