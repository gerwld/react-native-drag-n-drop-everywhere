import React, { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";


export function Draglist(props) {
  const {
    data,
    style,
    contentContainerStyle,
    keyExtractor,
    onReordered,
    renderItem } = props;

  const [isDragging, setIsDragging] = useState(false);


  const onDragStart = (event) => {
    setIsDragging(true);
    console.log("start")
  }

  const onDragEnd = (event) => {
    setIsDragging(false);
    console.log("end")
  }




  return (

    <ScrollView style={style} scrollEnabled={!isDragging}>

      <View style={contentContainerStyle}>
        {data?.map((item, index) => (
          <DragItem {...{ key: keyExtractor(item), item, index, renderItem }} />
        ))}
      </View>

    </ScrollView>
  )
}

const DragItem = ({ item, index, renderItem }) => {
  const pressed = useSharedValue<boolean>(false);
  const offset = useSharedValue<number>(0);
  

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: (pressed.value ? 1 : 0),
    top: offset.value + (50 * (index + 1)),
    height: 50,
    backgroundColor: pressed.value ? '#b58df1' : 'transparent',
  }));

  const pan = Gesture.Pan()
    .onBegin(() => {
      pressed.value = true;
    })
    .onChange((event) => {
      offset.value = event.translationY;
    })
    .onFinalize(() => {
      offset.value = withSpring(0);
      pressed.value = false;
    })

  const styles = StyleSheet.create({
    block: {
      width: "100%",
      position: "absolute",
      top: (50 * (index + 1)),
      flexDirection: "row"
    },
    childContent: {
      flex: 1,
      maxWidth: "80%",
    }
  });

  return (
    <Animated.View {
      ...{
        style: [styles.block, animatedStyles]
      }
    }>
      <View style={styles.childContent}>{renderItem({ item, })}</View>
      <GestureDetector gesture={pan}>
        <Text>dfbd</Text>
      </GestureDetector>
    </Animated.View>
  )
}