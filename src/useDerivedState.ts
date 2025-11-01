import { useMemo } from "react";
import { AsyncDispatch, AsyncState } from "./State.js";

async function setDerived<Original, Derived>(
  valueOrUpdate: Parameters<AsyncDispatch<Derived>>[0],
  setOriginal: AsyncDispatch<Original>,
  toOriginal: (derived: Derived, prevOriginal: Original) => Original,
  prevOriginal: Original,
  prevDerived: Derived,
): Promise<Derived> {
  const newDerivedValue: Derived = await (valueOrUpdate instanceof Function
    ? valueOrUpdate(prevDerived)
    : valueOrUpdate);
  const newOriginalValue = toOriginal(newDerivedValue, prevOriginal);
  await setOriginal(newOriginalValue);
  return newDerivedValue;
}

/**
 * A React Hook that provides a derived `AsyncState` by applying conversion functions.
 * This allows you to work with a transformed version of an underlying asynchronous state.
 * When the derived state is updated, it updates the original state through a reverse transformation.
 *
 * @template Derived The type of the derived state value.
 * @template Original The type of the original state value. Defaults to Derived if not specified.
 * @param {(original: Original) => Derived} toDerived A function that converts the original state value to the derived state value.
 * @param {(derived: Derived, prevOriginal: Original) => Original} toOriginal A function that converts the derived state value back to the original state value, receiving the previous original state `prevOriginal` to facilitate merging or partial updates.
 * @returns {(state: AsyncState<Original>) => AsyncState<Derived>} A function that accepts an `AsyncState` tuple of type `Original` and returns a derived `AsyncState` tuple of type `Derived`.
 */
export const useDerivedState =
  <Derived, Original = Derived>(
    toDerived: (original: Original) => Derived,
    toOriginal: (derived: Derived, prevOriginal: Original) => Original,
  ) =>
  ([original, setOriginal]: AsyncState<Original>): AsyncState<Derived> =>
    useMemo<AsyncState<Derived>>(() => {
      if (original === undefined) {
        return [undefined, undefined];
      }

      const derived = toDerived(original);

      const setDerivedState: AsyncDispatch<Derived> | undefined = setOriginal
        ? (valueOrUpdate) =>
            setDerived(
              valueOrUpdate,
              setOriginal,
              toOriginal,
              original,
              derived,
            )
        : undefined;

      return [derived, setDerivedState];
    }, [original, setOriginal, toDerived, toOriginal]);
