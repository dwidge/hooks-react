import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

/**
 * Type definition for items that must have an 'id' property.
 * This is essential for the `useItem` hook to identify specific items within the array.
 *
 * @typeparam T The type of the 'id' property (string or number).
 */
export type ItemWithId = { id: string | number };

/**
 * Type definition for the result of the `useList` hook.
 * It returns a tuple containing the array and its setter function, similar to `useState`.
 *
 * @typeparam T The type of items in the array, extending {@link ItemWithId}.
 */
export type UseListResult<T extends ItemWithId> = readonly [
  T[],
  Dispatch<SetStateAction<T[]>>,
];

/**
 * Type definition for the result of the `useItem` hook.
 * It returns a tuple containing a specific item (or null if not found) and its setter function, similar to `useState`.
 *
 * @typeparam T The type of items in the array, extending {@link ItemWithId}.
 */
export type UseItemResult<T extends ItemWithId> = readonly [
  T | null,
  Dispatch<SetStateAction<T | null>>,
];

/**
 * Type definition for the return value of the `useArray` hook.
 * It provides access to the list, its setter, and hooks for observing the entire list and individual items.
 *
 * @typeparam T The type of items in the array, extending {@link ItemWithId}.
 */
export type UseArrayResult<T extends ItemWithId> = {
  /**
   * The current array of items. You should generally use `useList` to get the list for reactive updates.
   */
  list: T[];
  /**
   * The setter function for the entire array. You should generally use `useList` to get the setter for reactive updates.
   */
  setList: Dispatch<SetStateAction<T[]>>;
  /**
   * Hook to observe and update the entire list. Returns a tuple: `[list, setList]`.
   * Re-renders components using this hook only when the array reference changes.
   *
   * @returns {@link UseListResult} - A tuple containing the list and its setter.
   */
  useList: () => UseListResult<T>;
  /**
   * Hook to observe and update a specific item in the list by its `id`. Returns a tuple: `[item, setItem]`.
   * Re-renders components using this hook only when the specific item with the given `itemId` changes.
   * If the item with the `itemId` does not exist, it returns `null` as the item.
   * Setting the item to `null` will remove the item from the list.
   *
   * @param itemId The `id` of the item to observe.
   * @returns {@link UseItemResult} - A tuple containing the item and its setter.
   */
  useItem: (itemId: string | number) => UseItemResult<T>;
};

/**
 * A general-purpose array hook that provides utilities for managing and observing arrays of items with IDs.
 * It leverages `useState` internally and offers hooks to observe the entire list (`useList`) and individual items (`useItem`).
 *
 * @typeparam T The type of items in the array. Must extend {@link ItemWithId} to ensure items have an 'id' property.
 * @param [list, setList] - Optional: An initial state tuple similar to the return value of `useState`. If provided, it uses this state instead of creating a new one internally. Useful for state persistence or sharing. Defaults to `useState<T[]>([])`.
 * @returns {@link UseArrayResult} - An object containing the list, setList, useList, and useItem hooks.
 *
 * @example
 * ```typescript
 * import { useArray, ItemWithId } from './useArray'; // Assuming useArray.ts
 *
 * interface MyItem extends ItemWithId {
 *   name: string;
 *   value: number;
 * }
 *
 * function MyComponent() {
 *   const { useList, useItem } = useArray<MyItem>();
 *   const [myList, setMyList] = useList();
 *   const [item1, setItem1] = useItem('item1');
 *
 *   // ... your component logic using myList, setMyList, item1, setItem1 ...
 * }
 * ```
 */
export function useArray<T extends ItemWithId>(
  [list, setList]: readonly [T[], Dispatch<SetStateAction<T[]>>] = useState<
    T[]
  >([]),
): UseArrayResult<T> {
  /**
   * Hook to get the current list and its setter.
   * @returns {@link UseListResult}
   */
  const useList = useCallback((): UseListResult<T> => {
    return [list, setList];
  }, [list, setList]);

  /**
   * Hook to get and set a specific item by its ID.
   * @param itemId The ID of the item to manage.
   * @returns {@link UseItemResult}
   */
  const useItem = useCallback(
    (itemId: string | number): UseItemResult<T> => {
      /**
       * Memoized item retrieval. Recomputes only when the list or itemId changes.
       */
      const item = useMemo(() => {
        return list.find((item) => item.id === itemId) || null;
      }, [list, itemId]);

      /**
       * Setter function for the specific item. Updates the list based on the new item value.
       * @param newItem The new item value or a function to update the item based on the previous item. Setting to `null` deletes the item.
       */
      const setItem = useCallback(
        (newItem: SetStateAction<T | null>) => {
          setList((currentList) => {
            const resolvedNewItem =
              typeof newItem === "function" ? newItem(item) : newItem;

            if (resolvedNewItem === null) {
              // Delete item if newItem is null
              return currentList.filter(
                (currentItem) => currentItem.id !== itemId,
              );
            } else {
              // Update or add item
              const existingIndex = currentList.findIndex(
                (currentItem) => currentItem.id === itemId,
              );
              if (existingIndex !== -1) {
                // Update existing item (replace it)
                const newList = [...currentList];
                newList[existingIndex] = resolvedNewItem;
                return newList;
              } else {
                // Add new item (if it wasn't there before)
                return [...currentList, resolvedNewItem];
              }
            }
          });
        },
        [itemId, setList, item],
      ); // item is included to correctly handle functional updates

      return [item, setItem];
    },
    [list, setList],
  ); // Only recreate useItem when list or setList changes

  return {
    list,
    setList,
    useList,
    useItem,
  };
}
