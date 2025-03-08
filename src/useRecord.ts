import { SetStateAction, useMemo, useState } from "react";
import { getActionValueSync, OptionalState } from "./State.js";

/**
 * Hook to observe record keys.
 * Re-renders components only when the record reference changes.
 * Memoizes the keys array for performance. Useful when only record keys are relevant for rendering.
 *
 * @typeparam K Record key type (string or number).
 * @typeparam V Record value type (not observed by this hook).
 * @param recordState Optional state tuple `[record, setRecord]`.
 * @returns Array of record keys, or `undefined` if record is `undefined`.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [myRecord, setMyRecord] = useState<{ [key: string]: { name: string } }>({
 *     item1: { name: "Apple" },
 *     item2: { name: "Banana" },
 *   });
 *   const recordKeys = useRecordKeys([myRecord]);
 *
 *   return (
 *     <div>
 *       <h3>Record Keys:</h3>
 *       <ul>
 *         {recordKeys ? recordKeys.map((key) => <li key={key}>{key}</li>) : <li>No keys</li>}
 *       </ul>
 *       <button onClick={() => setMyRecord({ ...myRecord, item3: { name: "Cherry" } })}>
 *         Add Item
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useRecordKeys = <K extends string | number, V>([
  record,
]: OptionalState<Record<K, V>>): K[] | undefined =>
  useMemo(() => (record ? (Object.keys(record) as K[]) : undefined), [record]);

/**
 * Hook to observe and update a specific record item by key (`itemId`). Returns `[item, setItem]`.
 * Re-renders components only when the specific `item` reference changes within the record,
 * or when the `record` or `itemId` reference changes.
 * Returns `undefined` as `item` if `itemId` is not in the record.
 *
 * Setting `item` to `null` via `setItem` removes the item from the record.
 *
 * **Memoization:**
 * - Memoizes `item` based on `record` and `itemId` references.
 * - Memoizes `setItem` for stable updates.
 *
 * **Performance Note:** Optimizes re-renders by tracking only the specific `item`.
 * Ensure immutable record updates for correct behavior and to maximize re-render prevention.
 *
 * @typeparam K Record key type (string or number).
 * @typeparam V Record value type.
 * @param recordState Optional state tuple `[record, setRecord]`.
 * @param itemId Key of the item to observe and update.
 * @returns Optional state tuple `[item, setItem]`:
 *          - `item`: The item value, or `undefined` if not found.
 *          - `setItem`: Function to update the item. Pass `null` to remove.
 *
 * @example
 * ```tsx
 * function ItemComponent({ itemId }: { itemId: string }) {
 *   const [myRecord, setMyRecord] = useState<{ [key: string]: { text: string, count: number } }>({
 *     itemA: { text: "First Item", count: 0 },
 *     itemB: { text: "Second Item", count: 5 },
 *   });
 *   const [item, setItem] = useRecordItem([myRecord, setMyRecord], itemId);
 *
 *   if (!item) {
 *     return <div>Item not found</div>;
 *   }
 *
 *   const incrementCount = () => {
 *     setItem((currentItem) => {
 *       return currentItem ? { ...currentItem, count: currentItem.count + 1 } : null; // Ensure currentItem exists
 *     });
 *   };
 *
 *   const updateText = (newText: string) => {
 *     setItem((currentItem) => {
 *       return currentItem ? { ...currentItem, text: newText } : null;
 *     });
 *   };
 *
 *   const removeItem = () => {
 *     setItem(null); // Setting to null removes the item
 *   };
 *
 *   return (
 *     <div>
 *       <h3>Item: {itemId}</h3>
 *       <p>Text: {item.text}</p>
 *       <p>Count: {item.count}</p>
 *       <button onClick={incrementCount}>Increment Count</button>
 *       <button onClick={() => updateText("Updated Text")}>Update Text</button>
 *       <button onClick={removeItem}>Remove Item</button>
 *     </div>
 *   );
 * }
 *
 * function RecordViewer() {
 *   return (
 *     <div>
 *       <ItemComponent itemId="itemA" />
 *       <ItemComponent itemId="itemB" />
 *     </div>
 *   );
 * }
 * ```
 */
export const useRecordItem = <K extends string | number, V>(
  [record, setRecord]: OptionalState<Record<K, V>>,
  itemId?: K,
): OptionalState<V | null> => {
  /**
   * Memoized item retrieval. Recomputes when record or itemId changes.
   */
  const item = useMemo(
    () => (record && itemId !== undefined ? record[itemId] : undefined),
    [record, itemId],
  );

  /**
   * Memoized item setter. Setting to `null` deletes the item from the record.
   */
  const setItem = useMemo(
    () =>
      record &&
      item != undefined &&
      itemId !== undefined &&
      setRecord !== undefined
        ? (newItem: SetStateAction<V | null>) => {
            return setRecord((currentRecord) => {
              const resolvedNewItem = getActionValueSync(newItem, item);

              const newList = { ...currentRecord }; // Create shallow copy

              if (resolvedNewItem === null) {
                // Delete item if newItem is null
                delete newList[itemId];
                return newList;
              } else {
                // Update or add item
                newList[itemId] = resolvedNewItem;
                return newList;
              }
            });
          }
        : undefined,
    [itemId, setRecord, item, record],
  );

  return [item, setItem];
};
