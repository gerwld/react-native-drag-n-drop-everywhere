import React, { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";



const clamp = (value, lowerBound, upperBound) => {
  "worklet";
  return Math.max(lowerBound, Math.min(value, upperBound));
};

const objectMove = (object, from, to) => {
  "worklet";
  const newObject = Object.assign({}, object);
  for (const id in object) {
    if (object[id] === from) {
      newObject[id] = to;
    }
    if (object[id] === to) {
      newObject[id] = from;
    }
  }
  return newObject;
};

const DragItem = (props) => {
  const {
    item,
    index,
    positions,
    scrollY,
    itemsGap,
    itemsCount,
    itemHeight,
    renderItem,
    renderGrip,
    passVibration,
    borderRadius,
    backgroundOnHold } = props;

  const pressed = useSharedValue(false);
  const offset = useSharedValue(0); // tracks the finger movement offset
  const startY = useSharedValue(0); //tracks the starting Y position of the item
  const top = useSharedValue(positions.value[item] * itemHeight);
  const [moving, setMoving] = useState(false);

  useAnimatedReaction(
    () => positions.value[item],
    (currentPosition, previousPosition) => {
      if (currentPosition !== previousPosition && !moving) {
        top.value = withSpring(currentPosition * itemHeight);
      }
    },
    [moving]
  );

  const isAndroid = Platform.OS === "android";

  const animatedStyles = useAnimatedStyle(() => {
    
    let anim = {
      zIndex: pressed.value ? 1 : 0,
      top: top.value + offset.value,  // adjusts the top based on the offset
      height: itemHeight,
      backgroundColor: pressed.value ? backgroundOnHold : "transparent",
    }
    let animBetter = {
      zIndex: pressed.value ? 1 : 0,
      top: top.value + offset.value,  // adjusts the top based on the offset
      height: itemHeight,
      backgroundColor: pressed.value ? backgroundOnHold : "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: isAndroid ? 0 : 5,
      shadowOpacity: isAndroid ? 0 : withSpring(pressed.value ? 0.2 : 0)
    }
    if(isAndroid)
      return anim
    return animBetter

  return anim;

});

  const pan = Gesture.Pan()
    .onBegin(() => {
      pressed.value = true;
      runOnJS(setMoving)(true);
      if (passVibration) passVibration();
      startY.value = top.value; //captures the initial Y position
    })
    .onChange((event) => {
      offset.value = event.translationY; // track how much the finger has moved

      const positionY = startY.value + event.translationY + scrollY.value; // calculates new position based on drag

      const newPosition = clamp(
        Math.floor(positionY / itemHeight),
        0,
        itemsCount - 1
      );

      if (newPosition !== positions.value[item]) {
        positions.value = objectMove(
          positions.value,
          positions.value[item],
          newPosition
        );
        if (passVibration) passVibration();
      }
    })
    .onFinalize(() => {
      offset.value = 0; // resets the offset
      top.value = (positions.value[item] * itemHeight) + 10; // jump range on release
      top.value = withSpring(positions.value[item] * itemHeight); // snaps back to new position
      pressed.value = false;
      runOnJS(setMoving)(false);
    });

  return (
    <Animated.View style={[styles.block, { borderRadius, marginBottom: itemsGap }, animatedStyles]}>
      <View style={styles.childContent}>{renderItem({ item })}</View>
      <GestureDetector gesture={pan}>
        {renderGrip ? <View style={styles.grip}>{renderGrip}</View> : <Text style={styles.useRG}>use the renderGrip prop :)</Text>}
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  block: {
    width: "100%",
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
  },
  childContent: {
    flex: 1,
    maxWidth: "97%",
  },
  useRG: {
    width: 50,
    fontSize: 9,
    textAlign: "center"
  },
  grip: {
    minWidth: 45,
    flexBasis: 45,
    flexGrow: 0,
    flexShrink: 0,
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  }
});

export default DragItem;
