import { useMemo } from "react";
import { AsyncDispatch, AsyncState } from "./State.js";
import { useNullish } from "@dwidge/utils-js";

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [prop: string]: Json };

/**
 * A React Hook that provides a JSON representation of a string value and a function to update it.
 * It synchronizes a string state with a JSON state.
 *
 * @param {AsyncState<string | null>} param0 An array containing the string value and the async dispatch function to update it.
 * @returns {AsyncState<Json | null>} An array containing the decoded JSON value and the async dispatch function to update it.
 */
export function useJson([stringValue, setStringValueAsync]: AsyncState<
  string | null
>): AsyncState<Json | null> {
  const decodedValue = toJson_fromString(stringValue);
  const setDecodedValueAsync = useMemo(
    () =>
      setStringValueAsync
        ? ((async (newValue) => {
            const resolvedValue =
              newValue instanceof Function
                ? newValue(decodedValue ?? (null as Json | null))
                : newValue;
            const stringifiedValue = toString_fromJson(resolvedValue);
            await setStringValueAsync(stringifiedValue);
            return newValue;
          }) as AsyncDispatch<Json | null>)
        : undefined,
    [decodedValue, setStringValueAsync],
  );

  return [decodedValue, setDecodedValueAsync];
}

/**
 * Parses a string to a JSON object.
 *
 * @param {string | null | undefined} s The string to parse.
 * @returns {Json | null | undefined} The parsed JSON object, null if the string is "null", or undefined if the string is undefined.
 * @throws {SyntaxError} If the string is not a valid JSON.
 */
const toJson_fromString = useNullish((s: string): Json => JSON.parse(s));

/**
 * Stringifies a JSON object to a string.
 *
 * @param {Json | null | undefined} json The JSON object to stringify.
 * @returns {string | null} The stringified JSON object, or null if the input is null or undefined.
 */
export const toString_fromJson = useNullish((json: Json): string =>
  JSON.stringify(json),
);
