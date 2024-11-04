// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { OptionalState } from "./State.js";
import { useSaveState } from "./useSaveState.js";

export const useSaveOnExitState = <T>(
  [value, setValue]: OptionalState<T>,
  delayMs = 1000,
  [internal, setInternal] = useSaveState([value, setValue], true, delayMs),
): OptionalState<T> => [internal, setInternal];
