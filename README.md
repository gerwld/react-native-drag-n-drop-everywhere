# react-native-drag-n-drop-everywhere

A scrollable React Native drag-and-drop library that doesn't use FlatList, which can sometimes cause re-render issues. Designed to work on Web, iOS, and Android.  
Built with `react-native-reanimated` and `react-native-gesture-handler`. Supports custom item rendering, grips for drag initiation, and more.

| Web Preview | iOS Preview | Android Preview |
| ----------- | ----------- | --------------- |
| <img height="450" width="220" style="min-width: 200px;" alt="Web Preview" src="https://github.com/chesshelper/chesshelper.github.io/blob/main/assets/storage/drag-n-drop/web.gif?raw=true"/> | <img height="450" width="207" style="min-width: 200px;" alt="iOS Preview" src="https://github.com/chesshelper/chesshelper.github.io/blob/main/assets/storage/drag-n-drop/ios.gif?raw=true"/> | <img height="450" width="207" style="min-width: 200px;" alt="Android Preview" src="https://github.com/chesshelper/chesshelper.github.io/blob/main/assets/storage/drag-n-drop/android.gif?raw=true"/> |

## Live Demo

- [CodeSandbox](https://codesandbox.io/p/live/7a567fdd-36ad-4494-9336-1075e66fd544)

## Installation

```bash
npm install react-native-drag-n-drop-everywhere
```

Ensure you have installed and configured the following:
- `react-native-reanimated`
- `react-native-gesture-handler`
- (Optional) For haptic feedback on iOS: `expo-haptics`

For setup instructions, refer to their documentation:
- [react-native-reanimated setup](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [react-native-gesture-handler setup](https://docs.swmansion.com/react-native-gesture-handler/docs/installation)

## Usage

```jsx
import { Platform, Text, View } from 'react-native';
import DragList from 'react-native-drag-n-drop-everywhere';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const MyDragList = () => {
  const dataIDsArray = [
    "95a6885b-64ab-468c-9334-62c4095df459",
    "b592f039-b4d6-420a-b731-0964172ed142",
    "dba923d8-6743-47ab-8923-8e45eacdb204",
  ];

  const data = {
    "95a6885b-64ab-468c-9334-62c4095df459": 
      { title: 'Entertainment', type: "CATEGORY_TYPE_EXPENSES" },
    "b592f039-b4d6-420a-b731-0964172ed142": 
      { title: 'Groceries', type: "CATEGORY_TYPE_EXPENSES" },
    "dba923d8-6743-47ab-8923-8e45eacdb204": 
      { title: 'Sport', type: "CATEGORY_TYPE_EXPENSES" },
  };

  const renderItem = ({ item }) => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text>{data[item].title}</Text>
      <Text>{data[item].type}</Text>
    </View>
  );

  const renderGrip = () => (
      <Text style={{ fontSize: 30, lineHeight: 30, fontWeight: "600" }}>:::</Text>
  );

  const onUpdateCallback = (newSortedData) => {
    // Do not change dataIDsArray directly in useState. It will cause two-way binding and extra re-renders. 
    // Instead, dispatch this value
    console.log(newSortedData);
  };

  return (
    <DragList
      dataIDs={dataIDsArray}                  // Array of IDs, required
      renderItem={renderItem}                 // Required
      callbackNewDataIds={onUpdateCallback}   // Required, callback for sorted result (dataIDs)
      renderGrip={renderGrip}

      style={{ paddingTop: 100 }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      itemContainerStyle={{ borderWidth: 2 }}

      itemsGap={10}
      itemHeight={60}
      itemBorderRadius={8}
      backgroundOnHold={"#f0f0f0"}
      passVibration={() => {
        if (Platform.OS === 'ios') {
          runOnJS(Haptics.impactAsync)(
            Haptics.ImpactFeedbackStyle.Medium
          );
        }
      }}
    />
  );
};

```

### Preventing Extra Re-renders (Optional)
If you're using global state (e.g., Redux) to store `arrayIDs` and update them in `callbackNewDataIds`, and you want to prevent extra re-renders of your `DragList` component, use this approach in the parent component:
```JSX

import { useStore } from 'react-redux';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native'

const ParentComponent = () => {
  const store = useStore();
  const [items, setItems] = useState(null);

  useFocusEffect(() => { // or, useEffect if you don't want to focus it onGoback / etc
    const state = store.getState();
    const itemsIDs = state.categories.itemsIds; // your itemsIds in state
    setItems(itemsIDs.slice()); // slice to avoid direct reference
  });

  if (!items) return null;

  return (
    // Your parent component JSX
  );
};
```


## Props

| Prop                   | Type       | Default    | Required | Description                                                                 |
|------------------------|------------|------------|----------|-----------------------------------------------------------------------------|
| `dataIDs`              | Array      | `[]`       | Yes      | An array of unique identifiers corresponding to each list item.             |
| `renderItem`           | Function   | -          | Yes      | Function to render each list item. Receives `{ item }` as its first argument. |
| `callbackNewDataIds`   | Function   | -          | Yes      | Callback that receives changes (sorted array of dataIDs). Note: do not change the provided dataIDs array directly in state, as it will cause two-way binding and extra re-renders. |
| `renderGrip`           | Function   | `null`     | No       | Optional function to render a grip for dragging.                            |
| `itemsGap`             | Number     | `5`        | No       | The space (in pixels) between each list item.                               |
| `itemHeight`           | Number     | `50`       | No       | The height (in pixels) of each item.                                        |
| `style`                | Object     | `{}`       | No       | Custom styles for the `ScrollView`.                                         |
| `contentContainerStyle`| Object     | `{}`       | No       | Custom styles for the content container of the `ScrollView`.                |
| `itemContainerStyle`   | Object     | `{}`       | No       | Custom styles for the container of each individual item.                    |
| `itemBorderRadius`     | Number     | `10`       | No       | The border radius of each draggable item.                                   |
| `backgroundOnHold`     | String     | `#e3e3e3`  | No       | The background color of an item while it's being dragged.                   |
| `passVibration`        | Function   | `null`     | No       | Function to trigger haptic feedback when an item starts moving.             |

### Notes

- `dataIDs`: Should be an array of unique identifiers (strings) that correspond to each list item.
- `keyExtractor`: A function that extracts the key from each item in the data. Commonly, this will be the item's ID.
- `renderGrip`: Customize the drag handle or "grip" for each item. Defaults to a `Text` grip if not provided.
- `passVibration`: For iOS, you can use `Expo Haptics` to trigger haptic feedback when the drag starts.

## License

MIT

--- 