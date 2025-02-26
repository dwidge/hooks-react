// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Dispatch, SetStateAction } from "react";

/**
 * Module defining state management types and utilities with a specific idiom for handling loading/uninitialized and unset values.
 *
 * **Undefined vs. Null (or other sentinel values) for State Values:**
 *
 * This module establishes a convention where:
 *
 * - **`undefined` as a state value is reserved to indicate a loading or uninitialized state.**  When you encounter `undefined` as the first element in `OptionalState<T>` or `AsyncState<T, S>`, it signifies that the state is currently being fetched or has not yet been initialized.  This is a transient state. Once loading/initialization is complete, the value should transition to a concrete value or a designated "unset" value.
 *
 * - **To represent an intentionally unset or absent value *after* loading is complete, use a specific value within your type `T` (e.g., `null`, `""`, `-1`, or any other value appropriate for your domain).** For instance, if you are fetching user data and the user might not exist, upon successful loading, you would represent the "user not found" state as `null` (if `null` is part of your `T` type), or an empty object, or some other sentinel value, not `undefined`. This clearly distinguishes between "still loading" (`undefined` in `OptionalState`/`AsyncState`) and "loaded, and the value is intentionally unset or absent" (e.g., `null`, `""`, `-1`).
 *
 * **Read-only State:**
 *
 * In all state tuple types (`State`, `BufferedState`, `OptionalState`, `AsyncState`), if the setter function (the second element of the tuple) is `undefined`, it signifies that the state is intended to be read-only from the perspective of the component receiving this tuple.  The state might still be updated internally by the source providing this read-only view.
 *
 * **Deprecated `State` and `BufferedState`:**
 *
 * The `State<T>` and `BufferedState<T>` types are now deprecated. They do not inherently support the `undefined` for loading idiom. For new code, prefer `OptionalState<T>` or `AsyncState<T, S>` which are designed to work with this idiom.  `State<T>` and `BufferedState<T>` are maintained for backward compatibility with existing code that does not rely on the `undefined` loading convention.
 */

/**
 * Functional state update.
 * @template T State type.
 */
export type Updater<T> = (prev: T) => T;

/**
 * State tuple like `useState`.
 * - `undefined` setter: read-only.
 * - Use a specific value in your type `T` (e.g., `null`) for unset values if needed.
 * @deprecated Use `OptionalState` or `AsyncState` instead for new code to support the `undefined` loading idiom.
 * @template T State type. Use a specific value in `T` (e.g., `null`) for unset values if needed.
 * @property {T} 0 State value.
 * @property {Dispatch<T> | undefined} 1 State setter (`undefined` = read-only).
 */
export type State<T> = [T, Dispatch<T>?];

/**
 * State tuple with `Updater` setter.
 * - `undefined` setter: read-only.
 * - Use a specific value in your type `T` (e.g., `null`) for unset values if needed.
 * @deprecated Use `OptionalState` or `AsyncState` instead for new code to support the `undefined` loading idiom.
 * @template T State type. Use a specific value in `T` (e.g., `null`) for unset values if needed.
 * @property {T} 0 State value.
 * @property {Dispatch<Updater<T>> | undefined} 1 Updater setter (`undefined` = read-only).
 */
export type BufferedState<T> = [T, Dispatch<Updater<T>>?];

/**
 * Optional state tuple.
 * - `undefined` value: loading/uninitialized.
 * - `undefined` setter: read-only.
 * - Use a specific value in your type `T` (e.g., `null`) for unset values after loading.
 * @template T Optional state type. Use a specific value in `T` (e.g., `null`) for unset values.
 * @property {T | undefined} 0 State value (`undefined` = loading).
 * @property {Dispatch<SetStateAction<T>> | undefined} 1 State setter (`undefined` = read-only).
 */
export type OptionalState<T> = [T?, Dispatch<SetStateAction<T>>?];

/**
 * Asynchronous state tuple.
 * - `undefined` value: loading/uninitialized.
 * - `undefined` setter: read-only.
 * - Use a specific value in your type `T` (e.g., `null`) for unset values after loading.
 * @template T State type exposed to consumer. Use a specific value in `T` (e.g., `null`) for unset values after loading.
 * @template S Type accepted by `AsyncDispatch`.
 * @property {T | undefined} 0 State value (`undefined` = loading).
 * @property {AsyncDispatch<S> | undefined} 1 Async state dispatcher (`undefined` = read-only).
 */
export type AsyncState<T, S = T> = [T?, AsyncDispatch<S>?];

/**
 * Asynchronous state dispatcher. Returns promise of new state.
 * @template A Dispatched value type.
 */
export type AsyncDispatch<A> = (value: SetStateActionAsync<A>) => Promise<A>;

/**
 * Possible values for `AsyncDispatch`.
 * - Value `A`, Promise of `A`, or updater function returning `A` or Promise of `A`.
 * @template A State value type.
 */
export type SetStateActionAsync<A> =
  | A
  | Promise<A>
  | ((prevState: A) => A | Promise<A>);

/**
 * Resolves `SetStateActionAsync` to its value asynchronously.
 * @template A Value type.
 * @param {SetStateActionAsync<A>} v Action to resolve.
 * @param {A} prev Previous state value.
 * @returns {Promise<A>} Resolved value.
 */
export const getActionValue = async <A>(
  v: SetStateActionAsync<A>,
  prev: A,
): Promise<A> =>
  typeof v === "function" ? (v as (prevState: A) => A | Promise<A>)(prev) : v;

/**
 * Resolves `SetStateAction` to its value synchronously.
 * @template A Value type.
 * @param {SetStateAction<A>} v Action to resolve.
 * @param {A} prev Previous state value.
 * @returns {A} Resolved value.
 */
export const getActionValueSync = <A>(v: SetStateAction<A>, prev: A): A =>
  typeof v === "function" ? (v as (prevState: A) => A)(prev) : v;
