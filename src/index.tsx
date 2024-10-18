import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSharedValue, useAnimatedRef, useAnimatedReaction, scrollTo } from "react-native-reanimated";
import DragItem from "./DragItem";

export function DragList(props) {
  const {
    data,
    style,
    contentContainerStyle,
    keyExtractor,
    renderItem,
    renderGrip,
    passVibration,
    borderRadius = 10,
    backgroundOnHold = "#e3e3e3"
  } = props;

  let itemsGap = props.itemsGap || 5;
  let itemHeight = props.itemHeight || 50;

  // ['id', 'id'] => {'id': 0, 'id': 1}
  function listToObject(list) {
    const object = {};
    list.forEach((item, i) => {
      object[item] = i;
    });
    return object;
  }
  // to get position, use: positions.value["id"]
  const positions = useSharedValue(listToObject(data));
  const scrollY = useSharedValue(0);
  const scrollViewRef = useAnimatedRef();

  useAnimatedReaction(
    () => scrollY.value,
    (scrolling) => {
      scrollTo(scrollViewRef, 0, scrolling, false);
    }
  );

  const containerStyles = StyleSheet.create({
    scrollViewContent: {
      height: data.length * itemHeight + itemsGap,
    },
  });

  return (
    <ScrollView
      ref={scrollViewRef}
      scrollEventThrottle={16}
      contentContainerStyle={[contentContainerStyle, containerStyles.scrollViewContent]}
      style={style}
    >
      <View style={contentContainerStyle}>
        {data?.map((item, index) => (
          <DragItem
            {...{
              // @ts-ignore
              key: keyExtractor(item),
              item,
              index,
              positions,
              scrollY,
              itemsCount: data.length,
              itemsGap,
              itemHeight,
              renderGrip,
              renderItem,
              passVibration,
              borderRadius,
              backgroundOnHold,
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}
