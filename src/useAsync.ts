// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { useEffect, useMemo, useState } from "react";
import { useDeepMemo } from "./useDeepMemo.js";

export const useAsync = <F extends (...args: any[]) => Promise<any>>(
  f: F | undefined,
  args?: Parameters<F>,
): [
  wrappedFunction: F | undefined,
  busy: boolean,
  error: Error | undefined,
  result: Awaited<ReturnType<F>> | undefined,
] => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [result, setResult] = useState<Awaited<ReturnType<F>> | undefined>(
    undefined,
  );

  const wrappedFunction = useMemo(
    () =>
      f
        ? ((async (...args: Parameters<F>) => {
            setBusy(true);
            setError(undefined);
            setResult(undefined);
            try {
              const executionResult = await f(...args);
              setResult(executionResult);
              return executionResult;
            } catch (e) {
              setError(e as Error);
              // throw e;
            } finally {
              setBusy(false);
            }
          }) as F)
        : undefined,
    [f],
  );

  // Initial call if arg is provided
  useEffect(() => {
    if (args !== undefined && wrappedFunction) {
      wrappedFunction(...args).catch(() => {
        // Error is already handled by wrappedFunction and setError state.
      });
    }
  }, [wrappedFunction, useDeepMemo(args !== undefined ? args : null)]);

  return useMemo(
    () => [wrappedFunction, busy, error, result],
    [wrappedFunction, busy, error, result],
  );
};
