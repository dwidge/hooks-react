// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { AsyncDispatch, AsyncState, OptionalState } from "./State.js";
import { TimeoutId } from "./TimeoutId.js";

export function useSaveState<T>(
  [externalState, setExternalState]: OptionalState<T> | AsyncState<T>,
  autoSaveOnUnmount: boolean = true,
  debounceMs: number | undefined = undefined,
): [
  ...OptionalState<T>,
  changed: boolean,
  save: () => void,
  revert: () => void,
] {
  const [internalState, setInternalState] = useState<T | undefined>(
    externalState,
  );
  const [changed, setChanged] = useState<boolean>(false);

  const internalStateRef = useRef(internalState);
  const changedRef = useRef(changed);
  const debounceTimerRef = useRef<TimeoutId>();

  useEffect(() => {
    internalStateRef.current = internalState;
    changedRef.current = changed;
  }, [internalState, changed]);

  useEffect(() => {
    if (!changed) setInternalState(externalState);
  }, [externalState, changed]);

  const setValue: Dispatch<SetStateAction<T>> | undefined =
    internalState !== undefined
      ? (action: SetStateAction<T>) => {
          const updatedInternalState =
            typeof action === "function"
              ? (action as (prevState: T) => T)(internalState)
              : action;

          if (updatedInternalState !== internalState) {
            setInternalState(updatedInternalState);
            setChanged(true);

            if (debounceMs !== undefined) {
              if (debounceTimerRef.current)
                clearTimeout(debounceTimerRef.current);

              debounceTimerRef.current = setTimeout(() => {
                save();
              }, debounceMs);
            }
          }

          return updatedInternalState;
        }
      : undefined;

  const save = () => {
    if (
      changedRef.current &&
      setExternalState &&
      internalStateRef.current !== undefined
    ) {
      setExternalState(internalStateRef.current);
      setChanged(false);
    }
  };

  const revert = () => {
    if (changedRef.current) {
      setInternalState(externalState);
      setChanged(false);
    }
  };

  useEffect(
    () => () => {
      if ((autoSaveOnUnmount || debounceMs !== undefined) && changedRef.current)
        save();

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    },
    [],
  );

  return [internalState, setValue, changed, save, revert];
}

export function useAsyncSaveState<T>(
  [externalState, setExternalState]: OptionalState<T> | AsyncState<T>,
  autoSaveOnUnmount: boolean = true,
  debounceMs: number | undefined = undefined,
): [...AsyncState<T>, changed: boolean, save: () => void, revert: () => void] {
  const [internalState, setInternalState] = useState<T | undefined>(
    externalState,
  );
  const [changed, setChanged] = useState<boolean>(false);

  const internalStateRef = useRef(internalState);
  const changedRef = useRef(changed);
  const debounceTimerRef = useRef<TimeoutId>();

  useEffect(() => {
    internalStateRef.current = internalState;
    changedRef.current = changed;
  }, [internalState, changed]);

  useEffect(() => {
    if (!changed) setInternalState(externalState);
  }, [externalState, changed]);

  const setValue: AsyncDispatch<SetStateAction<T>> | undefined =
    internalState !== undefined
      ? async (action: SetStateAction<T>) => {
          const updatedInternalState =
            typeof action === "function"
              ? (action as (prevState: T) => T)(internalState)
              : action;

          if (updatedInternalState !== internalState) {
            setInternalState(updatedInternalState);
            setChanged(true);

            if (debounceMs !== undefined) {
              if (debounceTimerRef.current)
                clearTimeout(debounceTimerRef.current);

              debounceTimerRef.current = setTimeout(() => {
                save();
              }, debounceMs);
            }
          }

          return updatedInternalState;
        }
      : undefined;

  const save = () => {
    if (
      changedRef.current &&
      setExternalState &&
      internalStateRef.current !== undefined
    ) {
      setExternalState(internalStateRef.current);
      setChanged(false);
    }
  };

  const revert = () => {
    if (changedRef.current) {
      setInternalState(externalState);
      setChanged(false);
    }
  };

  useEffect(
    () => () => {
      if ((autoSaveOnUnmount || debounceMs !== undefined) && changedRef.current)
        save();

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    },
    [],
  );

  return [internalState, setValue, changed, save, revert];
}
