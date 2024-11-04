// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { useMemo, useState } from "react";
import { OptionalState } from "./State.js";

/**
 * A custom React hook that returns a memoized state and a setter function.
 * When you pass the tuple to a component, it will not cause unnecessary rerenders of that component.
 *
 * @template T - The type of the state.
 * @param {T} init - The initial state value.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} A tuple containing the current state and a function to update it.
 */
export const useOptionalMemoState = <T>([
  state,
  setState,
]: OptionalState<T>): OptionalState<T> =>
  useMemo(() => [state, setState], [state, setState]);

export const useMemoState = <T>(
  init: T,
  [state, setState] = useState<T>(init),
) =>
  useMemo(
    () => [state, setState] as [T, React.Dispatch<React.SetStateAction<T>>],
    [state, setState],
  );
