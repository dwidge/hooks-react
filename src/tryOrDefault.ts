/**
 * Creates a new function that behaves like the original function,
 * but returns null if the original function throws an error.
 *
 * @param func The function to wrap.
 * @returns A new function that returns the same type as the original function or null.
 */
export const tryOrDefault = <Args extends any[], Return>(
  func: (...args: Args) => Return,
  defaultReturn: Return,
): ((...args: Args) => Return) => {
  return (...args: Args) => {
    try {
      return func(...args);
    } catch (error) {
      // console.log("tryOrDefault1", error, args);
      return defaultReturn;
    }
  };
};

/**
 * Creates a new function that tries a chain of functions.
 * It executes each function in the provided array in order.
 * If a function succeeds (doesn't throw an error), its result is returned, and the chain stops.
 * If a function throws an error, the next function in the chain is tried.
 * If all functions in the chain throw errors, the last error thrown is re-thrown.
 *
 * @param funcs An array of functions to try in order.
 * @returns A new function that executes the chain.
 * @throws The last error thrown by the functions if all functions fail.
 */
export const tryChain = <Args extends any[], Return>(
  ...funcs: ((...args: Args) => Return)[]
): ((...args: Args) => Return) => {
  return (...args: Args) => {
    let lastError: any = undefined;
    for (const func of funcs) {
      try {
        return func(...args); // If successful, return immediately
      } catch (error) {
        // console.log("tryChain caught error:", error);
        lastError = error; // Store the error and continue to the next function
      }
    }

    if (lastError !== undefined) {
      // console.log("tryChain throwing last error:", lastError);
      throw lastError; // If all functions failed, throw the last error
    }

    // This line should ideally not be reached if the input array `funcs` is not empty
    // and we expect at least one function to succeed under normal circumstances.
    // However, if `funcs` is empty or all functions are designed to throw in all cases,
    // and we still reach here, it might indicate an unexpected situation or logic error
    // in the calling code.
    // For robustness, and to explicitly handle the case where no function succeeded
    // and no error was explicitly thrown by the loop (e.g., if `funcs` was empty),
    // we can throw a default error or return a default value if appropriate for your use case.
    // In this implementation, we throw the last error, which will be undefined if funcs was empty and no error was ever assigned.
    // Throwing undefined is not ideal, so let's throw a more informative error if funcs is empty.

    if (funcs.length === 0) {
      throw new Error("tryChain: No functions provided to try.");
    }

    // If we reach here and lastError is still undefined (and funcs is not empty), it means no error was caught in the loop,
    // but also no function returned a value (which shouldn't happen based on the logic).
    // As a fallback, we throw the lastError (which might be undefined if funcs was empty, but we handled that above).
    throw lastError;
  };
};
