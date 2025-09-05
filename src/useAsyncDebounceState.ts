import { AsyncState } from "./State";
import { useAsyncSaveState } from "./useSaveState.js";

export const useAsyncDebounceState = <T>(
  [value, setValue]: AsyncState<T>,
  delayMs = 500,
  [internal, setInternal] = useAsyncSaveState([value, setValue], true, delayMs),
): AsyncState<T> => [internal, setInternal];
