// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { OptionalState } from "./State.js";

export const useLogState = <T>(
  message: string,
  [value, setValue]: OptionalState<T>,
): OptionalState<T> => [
  value,
  setValue && ((v) => (console.log(message, v), setValue(v))),
];
