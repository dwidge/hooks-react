# useArray Hook

A React hook for managing arrays of items with IDs, providing optimized updates and individual item observation.

## Features

- **Manages arrays of items with IDs:** Designed for arrays where each item has a unique `id` property (string or number).
- **Optimized re-renders:**
  - `useList` hook re-renders components only when the array reference changes, ideal for observing the entire list.
  - `useItem` hook re-renders components only when the specific item being observed changes, even if other items in the array are modified.
- **Individual item observation:** `useItem` allows you to track and update specific items within the array using their IDs.
- **Handles non-existent items:** `useItem` returns `null` if you try to observe an item ID that is not present in the array.
- **Item deletion:** Setting the item returned by `useItem` to `null` removes the item from the array.
- **Type-safe:** Built with TypeScript and generics for type safety and flexibility.
- **Exposes list and setList:** Provides direct access to the `list` and `setList` from the underlying `useState` for more control when needed.
- **Optional initial state:** Accepts an optional initial state tuple (like `useState`'s return) allowing for state persistence or sharing.

## Installation

Simply copy the `useArray.ts` code into your React project. No external dependencies are required.

## Usage

1.  **Import the hook and types:**

    ```typescript
    import { useArray, ItemWithId } from "./useArray"; // Adjust path if needed
    ```

2.  **Define your item type:**

    Your item type must extend the `ItemWithId` type, ensuring it has an `id` property.

    ```typescript
    interface MyItem extends ItemWithId {
      name: string;
      value: number;
    }
    ```

3.  **Use the `useArray` hook in your component:**

    ```typescript jsx
    import React from 'react';
    import { useArray, ItemWithId } from './useArray';

    interface MyItem extends ItemWithId {
      name: string;
      value: number;
    }

    function MyComponent() {
      const { useList, useItem, setList, list } = useArray<MyItem>(); // You can also pass initial state here
      const [myList, setMyList] = useList();
      const [item1, setItem1] = useItem('item1');
      const [item3, setItem3] = useItem('item3'); // Observing potentially non-existent item


      const handleAddItem = () => {
        setMyList([...myList, { id: `item${Date.now()}`, name: `New Item`, value: Math.random() }]);
      };

      const handleChangeItem1Name = () => {
        if (item1) {
          setItem1({ ...item1, name: `Item 1 - Updated ${Date.now()}` });
        }
      };

      const handleDeleteItem2 = () => {
        setMyList(myList.filter(item => item.id !== 'item2'));
      };

      const handleDeleteItem1 = () => {
        setItem1(null); // Setting item1 to null will delete it
      };

      const handleSetItem3 = () => {
        setItem3({ id: 'item3', name: 'Item 3 - Created', value: 30 });
      };


      // Initialize list with some data (optional, can also start with an empty array)
      React.useEffect(() => {
        if (myList.length === 0) {
          setMyList([
            { id: 'item1', name: 'Item 1', value: 10 },
            { id: 'item2', name: 'Item 2', value: 20 },
          ]);
        }
      }, [setMyList, myList.length]);


      return (
        <div>
          <h1>My List</h1>
          <ul>
            {myList.map(item => (
              <li key={item.id}>{item.name} - Value: {item.value}</li>
            ))}
          </ul>

          <h2>Item 1 Details (useItem Hook)</h2>
          <p>Name: {item1 ? item1.name : 'Item 1 not found'}</p>
          <button onClick={handleChangeItem1Name}>Update Item 1 Name</button>
          <button onClick={handleDeleteItem1}>Delete Item 1</button>

          <h2>Item 3 Details (useItem Hook - Initially Null)</h2>
          <p>Name: {item3 ? item3.name : 'Item 3 not found (initially null)'}</p>
          <button onClick={handleSetItem3}>Create Item 3</button>

          <button onClick={handleAddItem}>Add New Item to List</button>
          <button onClick={handleDeleteItem2}>Delete Item 2 (using setList)</button>
        </div>
      );
    }

    export default MyComponent;
    ```

### Examples

#### Basic Usage with `useList`

```typescript jsx
import React from 'react';
import { useArray, ItemWithId } from './useArray';

interface MyItem extends ItemWithId { name: string; }

function ListComponent() {
  const { useList } = useArray<MyItem>();
  const [items, setItems] = useList();

  const addItem = () => {
    setItems([...items, { id: `item-${Date.now()}`, name: `New Item ${items.length + 1}` }]);
  };

  return (
    <div>
      <ul>
        {items.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
      <button onClick={addItem}>Add Item</button>
    </div>
  );
}
```

#### Observing and Updating Individual Items with `useItem`

```typescript jsx
import React from 'react';
import { useArray, ItemWithId } from './useArray';

interface MyItem extends ItemWithId { name: string; description: string; }

function ItemDetails({ itemId }: { itemId: string }) {
  const { useItem } = useArray<MyItem>();
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
  const { useList } = useArray<MyItem>();
  const [items, setItems] = useList();
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setItems([
      { id: 'item1', name: 'Item One', description: 'Description for item one' },
      { id: 'item2', name: 'Item Two', description: 'Description for item two' },
    ]);
  }, [setItems]);


  return (
    <div>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <button onClick={() => setSelectedItemId(item.id)}>{item.name}</button>
          </li>
        ))}
      </ul>
      {selectedItemId && <ItemDetails itemId={selectedItemId} />}
    </div>
  );
}
```

## Types

### `ItemWithId`

```typescript
export type ItemWithId = { id: string | number };
```

- **`id`**: A unique identifier for each item in the array. Must be either a string or a number.

### `UseListResult<T extends ItemWithId>`

```typescript
export type UseListResult<T extends ItemWithId> = readonly [
  T[],
  Dispatch<SetStateAction<T[]>>,
];
```

- A tuple returned by `useList` hook, mirroring `useState`'s return value for the entire array.
  - **`T[]`**: The current array of items.
  - **`Dispatch<SetStateAction<T[]>>`**: The setter function to update the entire array.

### `UseItemResult<T extends ItemWithId>`

```typescript
export type UseItemResult<T extends ItemWithId> = readonly [
  T | null,
  Dispatch<SetStateAction<T | null>>,
];
```

- A tuple returned by `useItem` hook, mirroring `useState`'s return value for a single item.
  - **`T | null`**: The current item with the specified ID, or `null` if the item is not found.
  - **`Dispatch<SetStateAction<T | null>>`**: The setter function to update the specific item or delete it (by setting to `null`).

### `UseArrayResult<T extends ItemWithId>`

```typescript
export type UseArrayResult<T extends ItemWithId> = {
  list: T[];
  setList: Dispatch<SetStateAction<T[]>>;
  useList: () => UseListResult<T>;
  useItem: (itemId: string | number) => UseItemResult<T>;
};
```

- The return type of the `useArray` hook, providing access to:
  - **`list`**: The current array (for read-only access, use `useList` for reactive updates).
  - **`setList`**: The setter for the entire array (for direct array manipulation, use `useList` for reactive updates).
  - **`useList`**: Hook to observe and update the entire list.
  - **`useItem`**: Hook to observe and update a specific item by its `id`.

## Return Values of `useArray`

The `useArray` hook returns an object with the following properties:

- **`list: T[]`**: The current array of items. Access this for read-only purposes. For reactive updates, use `useList`.
- **`setList: Dispatch<SetStateAction<T[]>>`**: The setter function for the entire array. Use this for direct array manipulations. For reactive updates, use `useList`.
- **`useList: () => UseListResult<T>`**: A hook that returns a tuple `[list, setList]` for observing and updating the entire array reactively.
- **`useItem: (itemId: string | number) => UseItemResult<T>`**: A hook that returns a tuple `[item, setItem]` for observing and updating a specific item reactively based on its `id`.

This hook provides a flexible and efficient way to manage arrays of items with IDs in your React applications, offering optimized re-renders and convenient item-level control.
