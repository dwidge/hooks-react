// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Dispatch, SetStateAction } from "react";

export type Updater<T> = (prev: T) => T;
export type State<T> = [T, Dispatch<T>?];
export type BufferedState<T> = [T, Dispatch<Updater<T>>?];
export type OptionalState<T> = [T?, Dispatch<SetStateAction<T>>?];

export type AsyncState<T, S = T> = [T?, AsyncDispatch<S>?];
export type AsyncDispatch<A> = (value: SetStateActionAsync<A>) => Promise<A>;
export type SetStateActionAsync<A> =
  | A
  | Promise<A>
  | ((prevState: A) => A | Promise<A>);

export const getActionValue = async <A>(
  v: SetStateActionAsync<A>,
  prev: A,
): Promise<A> =>
  typeof v === "function" ? (v as (prevState: A) => A | Promise<A>)(prev) : v;
