// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import { Dispatch } from "react";

export type Updater<T> = (prev: T) => T;
export type State<T> = [T, Dispatch<T>?];
export type BufferedState<T> = [T, Dispatch<Updater<T>>?];
