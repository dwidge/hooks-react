# useRecord Hook

A React hook for managing records (objects) of items with custom keys, providing optimized updates and individual item observation.

## Features

- **Manages records of items with custom keys:** Designed for records where each item is accessed by a unique key (string or number).
- **Optimized re-renders:**
  - `useList` hook re-renders components only when the record reference changes, ideal for observing the entire record.
  - `useItem` hook re-renders components only when the specific item being observed changes, even if other items in the record are modified.
- **Individual item observation:** `useItem` allows you to track and update specific items within the record using their keys.
- **Handles non-existent items:** `useItem` returns `null` if you try to observe an item key that is not present in the record.
- **Item deletion:** Setting the item returned by `useItem` to `null` removes the item from the record.
- **Type-safe:** Built with TypeScript and generics for type safety and flexibility, supporting both key and value types.
- **Exposes record and setRecord:** Provides direct access to the `record` and `setRecord` from the underlying `useState` for more control when needed.
- **Optional initial state:** Accepts an optional initial state tuple (like `useState`'s return) allowing for state persistence or sharing.

## Installation

Simply copy the `useRecord.ts` code into your React project. No external dependencies are required.

## Usage

1.  **Import the hook and types:**

    ```typescript
    import { useRecord } from "./useRecord"; // Adjust path if needed
    ```

2.  **Define your item type (Value Type):**

    Define the type of the values you will store in the record.

    ```typescript
    interface MyItem {
      name: string;
      value: number;
    }
    ```

3.  **Use the `useRecord` hook in your component:**

    ```typescript jsx
    import React from 'react';
    import { useRecord } from './useRecord';

    interface MyItem {
      name: string;
      value: number;
    }

    function MyComponent() {
      const { useList, useItem, setRecord, record } = useRecord<string, MyItem>(); // Key type is string, Value type is MyItem
      const [myRecord, setMyRecord] = useList();
      const [item1, setItem1] = useItem('item1');
      const [item3, setItem3] = useItem('item3'); // Observing potentially non-existent item


      const handleAddItem = () => {
        const newItemKey = `item${Date.now()}`;
        setMyRecord({ ...myRecord, [newItemKey]: { name: `New Item`, value: Math.random() } });
      };

      const handleChangeItem1Name = () => {
        if (item1) {
          setItem1({ ...item1, name: `Item 1 - Updated ${Date.now()}` });
        }
      };

      const handleDeleteItem2 = () => {
        const newRecord = { ...myRecord };
        delete newRecord['item2'];
        setMyRecord(newRecord);
      };

      const handleDeleteItem1 = () => {
        setItem1(null); // Setting item1 to null will delete it
      };

      const handleSetItem3 = () => {
        setItem3({ name: 'Item 3 - Created', value: 30 });
      };


      // Initialize record with some data (optional, can also start with an empty record)
      React.useEffect(() => {
        if (Object.keys(myRecord).length === 0) {
          setMyRecord({
            'item1': { name: 'Item 1', value: 10 },
            'item2': { name: 'Item 2', value: 20 },
          });
        }
      }, [setMyRecord, myRecord]);


      return (
        <div>
          <h1>My Record</h1>
          <ul>
            {Object.entries(myRecord).map(([key, item]) => (
              <li key={key}>{item.name} - Value: {item.value} (Key: {key})</li>
            ))}
          </ul>

          <h2>Item 1 Details (useItem Hook)</h2>
          <p>Name: {item1 ? item1.name : 'Item 1 not found'}</p>
          <button onClick={handleChangeItem1Name}>Update Item 1 Name</button>
          <button onClick={handleDeleteItem1}>Delete Item 1</button>

          <h2>Item 3 Details (useItem Hook - Initially Null)</h2>
          <p>Name: {item3 ? item3.name : 'Item 3 not found (initially null)'}</p>
          <button onClick={handleSetItem3}>Create Item 3</button>

          <button onClick={handleAddItem}>Add New Item to Record</button>
          <button onClick={handleDeleteItem2}>Delete Item 2 (using setRecord)</button>
        </div>
      );
    }

    export default MyComponent;
    ```

### Examples

#### Basic Usage with `useList`

```typescript jsx
import React from 'react';
import { useRecord } from './useRecord';

interface MyItem { name: string; }

function RecordComponent() {
  const { useList } = useRecord<string, MyItem>();
  const [itemsRecord, setItemsRecord] = useList();

  const addItem = () => {
    const newItemKey = `item-${Date.now()}`;
    setItemsRecord({ ...itemsRecord, [newItemKey]: { name: `New Item ${Object.keys(itemsRecord).length + 1}` } });
  };

  return (
    <div>
      <ul>
        {Object.entries(itemsRecord).map(([key, item]) => <li key={key}>{item.name} (Key: {key})</li>)}
      </ul>
      <button onClick={addItem}>Add Item</button>
    </div>
  );
}
```

#### Observing and Updating Individual Items with `useItem`

```typescript jsx
import React from 'react';
import { useRecord } from './useRecord';

interface MyItem { name: string; description: string; }

function ItemDetails({ itemId }: { itemId: string }) {
  const { useItem } = useRecord<string, MyItem>();
  const [item, setItem] = useItem(itemId);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (item) {
      setItem({ ...item, description: e.target.value });
    }
  };

  if (!item) {
    return <p>Item not found.</p>;
  }

  return (
    <div>
      <h3>{item.name}</h3>
      <label>
        Description:
        <input
          type="text"
          value={item.description}
          onChange={handleDescriptionChange}
        />
      </label>
    </div>
  );
}

function ItemListWithDetails() {
  const { useList } = useRecord<string, MyItem>();
  const [itemsRecord, setItemsRecord] = useList();
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setItemsRecord({
      'item1': { name: 'Item One', description: 'Description for item one' },
      'item2': { name: 'Item Two', description: 'Description for item two' },
    });
  }, [setItemsRecord]);


  return (
    <div>
      <ul>
        {Object.entries(itemsRecord).map(([key, item]) => (
          <li key={key}>
            <button onClick={() => setSelectedItemId(key)}>{item.name} (Key: {key})</button>
          </li>
        ))}
      </ul>
      {selectedItemId && <ItemDetails itemId={selectedItemId} />}
    </div>
  );
}
```

## Types

### `UseRecordListResult<K extends string | number, V>`

```typescript
export type UseRecordListResult<K extends string | number, V> = readonly [
  Record<K, V>,
  Dispatch<SetStateAction<Record<K, V>>>,
];
```

- A tuple returned by `useList` hook, mirroring `useState`'s return value for the entire record.
  - **`Record<K, V>`**: The current record of items.
  - **`Dispatch<SetStateAction<Record<K, V>>>`**: The setter function to update the entire record.

### `UseRecordItemResult<K extends string | number, V>`

```typescript
export type UseRecordItemResult<K extends string | number, V> = readonly [
  V | null,
  Dispatch<SetStateAction<V | null>>,
];
```

- A tuple returned by `useItem` hook, mirroring `useState`'s return value for a single item.
  - **`V | null`**: The current item with the specified key, or `null` if the item is not found.
  - **`Dispatch<SetStateAction<V | null>>`**: The setter function to update the specific item or delete it (by setting to `null`).

### `UseRecordResult<K extends string | number, V>`

```typescript
export type UseRecordResult<K extends string | number, V> = {
  record: Record<K, V>;
  setRecord: Dispatch<SetStateAction<Record<K, V>>>;
  useList: () => UseRecordListResult<K, V>;
  useItem: (itemId: K) => UseRecordItemResult<K, V>;
};
```

- The return type of the `useRecord` hook, providing access to:
  - **`record`**: The current record (for read-only access, use `useList` for reactive updates).
  - **`setRecord`**: The setter for the entire record (for direct record manipulation, use `useList` for reactive updates).
  - **`useList`**: Hook to observe and update the entire record.
  - **`useItem`**: Hook to observe and update a specific item by its key.

## Return Values of `useRecord`

The `useRecord` hook returns an object with the following properties:

- **`record: Record<K, V>`**: The current record of items. Access this for read-only purposes. For reactive updates, use `useList`.
- **`setRecord: Dispatch<SetStateAction<Record<K, V>>>`**: The setter function for the entire record. Use this for direct record manipulations. For reactive updates, use `useList`.
- **`useList: () => UseRecordListResult<K, V>`**: A hook that returns a tuple `[record, setRecord]` for observing and updating the entire record reactively.
- **`useItem: (itemId: K) => UseRecordItemResult<K, V>`**: A hook that returns a tuple `[item, setItem]` for observing and updating a specific item reactively based on its key.

This hook provides a flexible and efficient way to manage records of items in your React applications, offering optimized re-renders and convenient item-level control.
