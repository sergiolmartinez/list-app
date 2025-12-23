import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

type Props = {
  item: any;
  onToggle: () => void;
  onDelete: () => void;
};

export default function TodoItem({ item, onToggle, onDelete }: Props) {
  // This renders the red background when you swipe right-to-left
  const renderRightActions = (progress: any, drag: any) => {
    return (
      <TouchableOpacity
        onPress={onDelete}
        className="bg-red-600 justify-center items-center w-20 mb-2 rounded-r-xl"
      >
        <Text className="text-white font-bold">Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        className={`p-4 mb-2 rounded-xl flex-row items-center bg-slate-800 ${
          item.is_complete ? "opacity-50" : ""
        }`}
      >
        <View
          className={`w-6 h-6 rounded-full border-2 mr-3 justify-center items-center ${
            item.is_complete
              ? "bg-green-500 border-green-500"
              : "border-gray-400"
          }`}
        >
          {item.is_complete && <Text className="text-white text-xs">✓</Text>}
        </View>
        <Text
          className={`text-white text-lg flex-1 ${
            item.is_complete ? "line-through text-gray-500" : ""
          }`}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
}
