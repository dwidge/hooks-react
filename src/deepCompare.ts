/**
 * Deeply compares two values to determine if they are equal.
 * Handles objects, arrays, and primitive types.
 *
 * @param a The first value.
 * @param b The second value.
 * @returns True if the values are deeply equal, false otherwise.
 */
export function deepCompare(a: any, b: any): boolean {
  if (a === b) {
    return true; // Strict equality (primitive values, same references)
  }

  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false; // Different types or one is null/primitive
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepCompare(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!b.hasOwnProperty(key) || !deepCompare(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  return false; // Fallback for other cases (shouldn't usually reach here for common objects/arrays)
}
