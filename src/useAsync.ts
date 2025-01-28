// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { useMemo, useState } from "react";

export const useAsync = <F extends (...args: any[]) => Promise<any>>(
  f: F | undefined,
): [f: F | undefined, busy: boolean, error: Error | null] => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wrappedFunction = useMemo(
    () =>
      f
        ? ((async (...args) => {
            setBusy(true);
            setError(null);
            try {
              const result = await f(...args);
              return result;
            } catch (e) {
              setError(e as Error);
              throw e;
            } finally {
              setBusy(false);
            }
          }) as F)
        : undefined,
    [f],
  );

  return useMemo(
    () => [wrappedFunction, busy, error],
    [wrappedFunction, busy, error],
  );
};
