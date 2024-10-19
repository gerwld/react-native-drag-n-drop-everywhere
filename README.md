# react-native-drag-n-drop-everywhere

Scrollable React Native Draglist library that doesn't use Flatlist, which sometimes may cause re-render issues. Designed to work on Web, iOS & Android.
Built with `react-native-reanimated` and `react-native-gesture-handler`. Supports custom item rendering, grips for drag initiation, and more.


| Web Preview | iOS Preview | Android Preview |
| ----------- | --------------- | ----------- |
| <img height="450" alt="Web Preview" src="https://github.com/chesshelper/chesshelper.github.io/blob/main/assets/storage/drag-n-drop/web.gif?raw=true"/> | <img height="450" alt="iOS Preview" src="https://github.com/chesshelper/chesshelper.github.io/blob/main/assets/storage/drag-n-drop/ios.gif?raw=true"/> | <img height="450" alt="Android Preview" src="https://github.com/chesshelper/chesshelper.github.io/blob/main/assets/storage/drag-n-drop/android.gif?raw=true"/> |

## Installation

```bash
npm install react-native-drag-n-drop-everywhere
```

Ensure you have installed and configured:
- `react-native-reanimated`
- `react-native-gesture-handler`
- (Optional) For haptic feedback on iOS: `expo-haptics`

For setup instructions, refer to their documentation:
- [react-native-reanimated setup](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [react-native-gesture-handler setup](https://docs.swmansion.com/react-native-gesture-handler/docs/installation)


## Usage

```jsx

import { Platform, Text, View } from 'react-native';
import { DragList } from 'react-native-drag-n-drop-everywhere';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const MyDragList = () => {g

  const dataIDsArray = [
    "95a6885b-64ab-468c-9334-62c4095df459",
    "b592f039-b4d6-420a-b731-0964172ed142",
    "b592f039-b4d6-420a-b731-0964172ed143",
  ]

  const data = {
    "95a6885b-64ab-468c-9334-62c4095df459":
      { title: 'Entertainment', icon: "Popcorn", color: '#ff3939', type: "CATEGORY_TYPE_EXPENSES" },
    "b592f039-b4d6-420a-b731-0964172ed142":
      { title: 'Groceries', icon: "Apple", color: '#3988ff', type: "CATEGORY_TYPE_EXPENSES" },
    "b592f039-b4d6-420a-b731-0964172ed143":
      { title: 'Sport', icon: "Apple", color: '#3988ff', type: "CATEGORY_TYPE_EXPENSES" },
  }


  const renderItem = ({ item }) => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text>{data[item].title}</Text>
    </View>
  );

  const renderGrip = () => (
    <View>
      <Text style={{ fontSize: 30, lineHeight: 30, fontWeight: "600" }}>:::</Text>
    </View>
  );

  const onUpdateCallback = (newSortedData) => {
    // do not change dataIDsArray directly in useState. It will cause 2 ways binding and extra rerenders. 
    // Instead, dispatch this value locally
    console.log(newSortedData);
  }

  return (
    <DragList
      dataIDs={dataIDsArray}                  // array of id's, required
      renderItem={renderItem}                 // required
      renderGrip={renderGrip}
      callbackNewDataIds={onUpdateCallback}   // required, sorted result callback

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

export default MyDragList
```

## Props

| Prop                   | Type       | Default    | Required | Description                                                                 |
|------------------------|------------|------------|----------|-----------------------------------------------------------------------------|
| `dataIDs`              | Array      | `[]`       | Yes      | An array of unique identifiers corresponding to each list item.             |
| `renderItem`           | Function   | -          | Yes      | Function to render each list item. Takes `{ item }` as its argument.         |
| `renderGrip`           | Function   | `null`     | No       | Optional function to render a grip for dragging.                            |
| `itemsGap`             | Number     | `5`        | No       | The space (in pixels) between each list item.                               |
| `itemHeight`           | Number     | `50`       | No       | The height (in pixels) of each item.                                        |
| `style`                | Object     | `{}`       | No       | Custom styles for the `ScrollView`.                                          |
| `contentContainerStyle`| Object     | `{}`       | No       | Custom styles for the content container of the `ScrollView`.                |
| `itemContainerStyle`   | Object     | `{}`       | No       | Custom styles for the container of each individual item.                    |
| `itemBorderRadius`     | Number     | `10`       | No       | The border radius of each draggable item.                                   |
| `backgroundOnHold`     | String     | `#e3e3e3`  | No       | The background color of an item while it's being dragged.                   |
| `passVibration`        | Function   | `null`     | No       | Function to trigger haptic feedback when an item starts moving.             |

### Notes

- `dataIDs`: Should be an array of unique identifiers (strings) that correspond to each list item.
- `keyExtractor`: A function that extracts the key from each item in the data. Commonly, this will be the item's id.
- `renderGrip`: Customize the drag handle or "grip" for each item. Defaults to a `Text` grip if not provided.
- `passVibration`: For iOS, you can use `Expo Haptics` to trigger haptic feedback when the drag starts.

## License

MIT
