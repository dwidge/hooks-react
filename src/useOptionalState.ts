// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { useState } from "react";
import { OptionalState } from "./State";
import { useMemoState } from "./useMemoState";

/**
 * A useState React hook with an optional setter.
 *
 * @template T - The type of the state.
 * @param {T} initialState - The initial state value.
 * @returns {OptionalState<T>} A tuple containing the current state and an optional setter function.
 */
export const useOptionalState = <T>(initialState: T) =>
  useMemoState(useState<T>(initialState) as OptionalState<T>);
