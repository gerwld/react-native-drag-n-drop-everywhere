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

// handles callback for the new, sorted array
const onCallbackData = (positions, callbackNewDataIds, prevArrayFromPositions) => {
  "worklet"
  const arrayFromPositions = Object.entries(positions)
    .sort(([, indexA], [, indexB]) => {
      const numIndexA = indexA as number; // Assert type as number
      const numIndexB = indexB as number; // Assert type as number
      return numIndexA - numIndexB;
    }) // Sort by the index (value)
    .map(([id]) => id); // Extract only the id (key)

  const stringifiedArray = JSON.stringify(arrayFromPositions);

  if (prevArrayFromPositions.current !== stringifiedArray) {
    prevArrayFromPositions.current = stringifiedArray;

    if (typeof callbackNewDataIds === "function") {
      callbackNewDataIds(arrayFromPositions);
    }
  }
}

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
    itemBorderRadius,
    itemContainerStyle,
    callbackNewDataIds,
    backgroundOnHold } = props;

  const prevArrayFromPositions = React.useRef(null);
  const currentRenderRef = React.useRef(1);  // TODO: better sort handler

  const pressed = useSharedValue(false);
  const offset = useSharedValue(0); // tracks the finger movement offset
  const startY = useSharedValue(0); // tracks the starting Y position of the item
  const top = useSharedValue(positions.value[item] * (itemHeight + itemsGap));
  const [moving, setMoving] = useState(false);

  // Updates the top position if positions.value (dataIDs) object was changed (without animation)
  // only for the new items in dataIDs
  useAnimatedReaction(
    () => positions.value,
    (currentPositions, prevPositions) => {
      if(currentPositions !== prevPositions && !moving && !top.value) {
        top.value = positions.value[item] * (itemHeight + itemsGap)
      }
    }
  )
  // animates top value correspondingly when position changes. 
  // To get rid of animation rm withSpring from line 98.
  useAnimatedReaction(
    () => positions.value[item],
    (currentPosition, previousPosition) => {
      if (currentPosition !== previousPosition && !moving) {
        top.value = withSpring(currentPosition * (itemHeight + itemsGap));
      }
    },
    [moving]
  );

  const isAndroid = Platform.OS === "android";


  const animatedStyles = useAnimatedStyle(() => {
    // to get rid of spreads and obj assign, basically 2 presets
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

    if (isAndroid)
      return anim
    return animBetter
  });





  const pan = Gesture.Pan()
    .onBegin(() => {
      pressed.value = true;
      runOnJS(setMoving)(true);
      if (passVibration) passVibration();
      startY.value = top.value; // captures the initial Y position
    })


    .onChange((event) => {
      offset.value = event.translationY; // track how much the finger has moved

      const positionY = startY.value + event.translationY + scrollY.value; // calculates new position based on drag

      const newPosition = clamp(
        Math.floor(positionY / (itemHeight + itemsGap)),
        0,
        itemsCount - 1
      );

      if (newPosition !== positions.value[item]) {

        const newMove = objectMove(
          positions.value,
          positions.value[item],
          newPosition
        );
        if (newMove && typeof newMove === "object") {
          runOnJS(() => {
            positions.value = newMove;
          })();
        }


        if (typeof passVibration === "function") runOnJS(passVibration)();
      }
    })
    .onFinalize(() => {
      offset.value = 0; // resets the offset
      top.value = (positions.value[item] * (itemHeight + itemsGap)) + 10; // jump range on release
      top.value = withSpring(positions.value[item] * (itemHeight + itemsGap)); // snaps back to new position
      pressed.value = false;

      // callback with ref when change was made
      onCallbackData(positions.value, callbackNewDataIds, prevArrayFromPositions);

      runOnJS(setMoving)(false);
    });

  return (
    <Animated.View style={[styles.block, { borderRadius: itemBorderRadius, marginBottom: itemsGap }, itemContainerStyle, animatedStyles]}>
      <View style={styles.childContent}>{renderItem({ item })}</View>
      <GestureDetector gesture={pan}>
        {renderGrip
          ? <View style={styles.grip}>{typeof renderGrip === "function" ? renderGrip() : renderGrip}</View>
          : <Text style={styles.useRG}>use the renderGrip prop :)</Text>}
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