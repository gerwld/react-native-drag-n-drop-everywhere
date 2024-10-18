import React, {useState} from "react"
import { Pressable, ScrollView, Text } from "react-native";

export function add(a: number, b: number): string {
  return a + b + "w";
}

export function Draglist () {
  const [a, b] = useState(1);

  return (
    <ScrollView>
    <Text>I'm a draglist {a}</Text>
    <Pressable onPress={() => b(a+1)}><Text>add 1</Text></Pressable>
    </ScrollView>
  )
}