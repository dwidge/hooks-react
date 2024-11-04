// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { OptionalState } from "./State.js";

export function useSyncedState<T, U>(
  defaultValue: U,
  [externalState, setExternalState]: OptionalState<T>,
  convertToInternal: (external: T) => U,
  convertToExternal: (internal: U) => T,
): [...OptionalState<U>, Error | undefined] {
  const [error, setError] = useState<Error | undefined>(undefined);
  const [internalState, setInternalState] = useState<U>(() => {
    try {
      if (externalState === undefined) return defaultValue;
      return convertToInternal(externalState);
    } catch (e) {
      setError(e as Error);
      console.log("useSyncedState1", defaultValue, e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      const convertedState =
        externalState !== undefined
          ? convertToInternal(externalState)
          : defaultValue;
      setError(undefined);
      if (JSON.stringify(convertedState) !== JSON.stringify(internalState))
        setInternalState(convertedState);
    } catch (e) {
      setError(e as Error);
      console.log("useSyncedState2", defaultValue, e);
    }
  }, [externalState, convertToInternal]);

  const setInternal: Dispatch<SetStateAction<U>> = (
    action: SetStateAction<U>,
  ) => {
    const updatedInternalState =
      typeof action === "function"
        ? (action as (prevState: U) => U)(internalState)
        : action;
    setInternalState(updatedInternalState);

    try {
      const newExternalState = convertToExternal(updatedInternalState);
      setError(undefined);
      if (
        setExternalState &&
        JSON.stringify(newExternalState) !== JSON.stringify(externalState)
      )
        setExternalState(newExternalState);
    } catch (e) {
      setError(e as Error);
      console.log("useSyncedState3", defaultValue, e);
    }
  };

  return [internalState, setInternal, error];
}
