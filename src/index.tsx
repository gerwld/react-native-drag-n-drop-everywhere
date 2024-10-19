import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSharedValue, useAnimatedRef, useAnimatedReaction, scrollTo, runOnJS } from "react-native-reanimated";
import DragItem from "./DragItem";

export function DragList(props) {
  const {
    dataIDs,
    data,
    style,
    callbackNewDataIds,
    contentContainerStyle,
    itemContainerStyle,
    renderItem,
    renderGrip,
    passVibration,
    borderRadius,
    backgroundOnHold = "#e3e3e3"
  } = props;

  if(!dataIDs && !data) {
    throw new Error("The \"dataIDs / data\" prop is missing. It should contain an array of identificators of your list items, for example, uuid's.");
  }

  if((dataIDs || data) && !Array.isArray(dataIDs || data)) {
    throw new Error("The \"dataIDs / data\" prop should be []. \nProvided:" + JSON.stringify((data || dataIDs)));
  }

  if(!renderItem) {
    // @ts-ignore
    throw new Error(
      'The "renderItem" prop is missing. You should pass R.C that will render your item based on identificator thar it recieves as {item: id} in the first argument. Example: `function renderItem({item}) {}'
    );
  }

  let itemsGap = props.itemsGap || 5;
  let itemHeight = props.itemHeight || 50;
  let itemBorderRadius = props.itemBorderRadius || 8;

  const keyExtractor = (id) => id;

  function listToObject(list) {
    const object = {};
    list.forEach((item, i) => {
      object[item] = i;
    });
    return object;
  }

  const positions = useSharedValue(listToObject(dataIDs || data));
  const currentRenderRef = React.useRef(1);  // TODO: better sort handler
  const scrollY = useSharedValue(0);
  const scrollViewRef = useAnimatedRef();

  const prevArrayFromPositions = React.useRef(null);

  // handles callback for new, sorted array
  useAnimatedReaction(
    () => positions.value,
    (positionsValue) => {
      if (currentRenderRef.current > 1) {
      const arrayFromPositions = Object.entries(positions.value)
      .sort(([, indexA], [, indexB]) => {
        const numIndexA = indexA as number; // Assert type as number
        const numIndexB = indexB as number; // Assert type as number
        return numIndexA - numIndexB;
      }) // Sort by the index (value)
      .map(([id]) => id); // Extract only the id (key)

      const stringifiedArray = JSON.stringify(arrayFromPositions);

      if (prevArrayFromPositions.current !== stringifiedArray) {
        prevArrayFromPositions.current = stringifiedArray;
        runOnJS(callbackNewDataIds)(arrayFromPositions);
      }
    }
    // @ts-ignore
    currentRenderRef?.current = (currentRenderRef?.current || 0) + 1
    },
    [currentRenderRef.current]
  );

  useAnimatedReaction(
    () => scrollY.value,
    (scrolling) => {
      scrollTo(scrollViewRef, 0, scrolling, false);
    }
  );

  const containerStyles = StyleSheet.create({
    scrollViewContent: {
      height: dataIDs.length * itemHeight + itemsGap,
    },
  });

  return (
    <ScrollView
      ref={scrollViewRef}
      scrollEventThrottle={16}
      contentContainerStyle={[contentContainerStyle, containerStyles.scrollViewContent]}
      style={style}
    >
      <View>
        {dataIDs?.map((item, index) => (
          <DragItem
            {...{
              key: keyExtractor(item),
              item,
              index,
              positions,
              scrollY,
              itemsCount: dataIDs.length,
              itemsGap,
              itemHeight,
              renderGrip,
              renderItem,
              itemBorderRadius,
              itemContainerStyle,
              passVibration,
              backgroundOnHold,
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}
