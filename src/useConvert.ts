import { useMemo } from "react";
import { AsyncDispatch, AsyncState } from "./State.js";

/**
 * A React Hook that provides a derived `AsyncState` by applying conversion functions.
 * This allows you to work with a transformed version of an underlying asynchronous state.
 * When the derived state is updated, it updates the original state through a reverse transformation.
 *
 * @template T The type of the original state value.
 * @template R The type of the derived state value. Defaults to T if not specified.
 * @param {(t: T) => R} toR A function that converts the original state value (type `T`) to the derived state value (type `R`).
 * @param {(r: R, prevT?: T) => T} toT A function that converts the derived state value (type `R`) back to the original state value (type `T`), optionally receiving the previous original state `prevT` to facilitate merging or partial updates.
 * @returns {(state: AsyncState<T>) => AsyncState<R>} A function that accepts an `AsyncState` tuple of type `T` and returns a derived `AsyncState` tuple of type `R`.
 */
export const useConvert =
  <T, R = T>(toR: (t: T) => R, toT: (r: R, prevT: T) => T) =>
  ([t, setT]: AsyncState<T>): AsyncState<R> => {
    const r = t === undefined ? undefined : toR(t);

    const setR = useMemo(
      () =>
        setT && t !== undefined
          ? ((async (getR) => {
              const newRValue: R = await (getR instanceof Function
                ? getR(r as R)
                : getR);
              const tValue: T = toT(newRValue, t);
              await setT(tValue);
              return newRValue;
            }) as AsyncDispatch<R>)
          : undefined,
      [r, setT, toT, t],
    );

    return [r, setR];
  };
