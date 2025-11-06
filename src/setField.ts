import { AsyncDispatch } from "./State.js";

export const setField = <T, K extends keyof T>(
  setValue: AsyncDispatch<T>,
  key: K,
  init: T[K],
): AsyncDispatch<T[K]> | undefined =>
  setValue
    ? (((value: T[K]) =>
        setValue((prev) => (prev ? { ...prev, [key]: value } : prev)).then(
          (v) => v?.[key] ?? init,
        )) as AsyncDispatch<T[K]>)
    : undefined;
