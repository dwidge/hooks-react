// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { useMemo } from "react";

export const useMemoValue = <T, A extends any[]>(
  fn: (...args: A) => T,
  args: A,
) => useMemo(() => fn(...args), args);
