import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from "react-native";
import { items, lists } from "../services/api";
import TodoItem from "../components/TodoItem";

type Props = {
  list: any; // The list object passed from Home
  onBack: () => void;
};

export default function ListDetailScreen({ list, onBack }: Props) {
  const [todoItems, setTodoItems] = useState<any[]>([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Update fetchItems to handle the loading spinner
  const fetchItems = async () => {
    try {
      const response = await items.getByList(list.id);
      const sorted = response.data.sort(
        (a: any, b: any) => Number(a.is_complete) - Number(b.is_complete)
      );
      setTodoItems(sorted);
    } catch (e) {
      console.error(e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!newItemTitle) return;
    await items.create(list.id, newItemTitle);
    setNewItemTitle("");
    fetchItems();
  };

  const toggleItem = async (item: any) => {
    // Optimistic Update: Update UI immediately before server responds (makes it feel instant)
    const newStatus = !item.is_complete;
    const updatedList = todoItems.map((i) =>
      i.id === item.id ? { ...i, is_complete: newStatus } : i
    );
    // Re-sort to move completed to bottom
    setTodoItems(
      updatedList.sort((a, b) => Number(a.is_complete) - Number(b.is_complete))
    );

    // Send to server in background
    await items.update(item.id, { is_complete: newStatus });
  };

  const handleDeleteItem = async (itemId: string) => {
    // Optimistic Update: Remove from UI immediately
    setTodoItems((prev) => prev.filter((i) => i.id !== itemId));

    // Send request to server
    try {
      await items.delete(itemId);
    } catch (e) {
      console.error("Failed to delete", e);
      // Optional: Re-fetch if it failed
      fetchItems();
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleShare = () => {
    Alert.prompt(
      "Share List",
      "Enter the email of the user to invite:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Invite",
          onPress: async (email) => {
            if (!email) return;
            try {
              await lists.share(list.id, email);
              Alert.alert("Success", `Shared with ${email}`);
            } catch (e) {
              Alert.alert("Error", "User not found or connection failed");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-900"
      // CHANGE 1: Increase offset (usually needs to be ~90-100 to clear headers/status bars on iOS)
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View className="flex-1 px-4 pt-4">
        {/* HEADER SECTION */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onBack} className="mr-4">
              <Text className="text-blue-400 text-lg">← Back</Text>
            </TouchableOpacity>
            <Text className="text-white text-3xl font-bold">{list.title}</Text>
          </View>

          <TouchableOpacity onPress={handleShare}>
            <Text className="text-blue-400 font-bold text-lg">Share +</Text>
          </TouchableOpacity>
        </View>

        {/* Items List */}
        <FlatList
          data={todoItems}
          keyExtractor={(item) => item.id}
          // 3. Add Refresh Control Here
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff" // White spinner for dark mode (iOS)
              colors={["#fff"]} // White spinner (Android)
            />
          }
          renderItem={({ item }) => (
            <TodoItem
              item={item}
              onToggle={() => toggleItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          )}
        />

        {/* Input Bar */}

        <View className="flex-row mt-4 mb-10">
          <TextInput
            className="flex-1 bg-slate-800 text-white p-4 rounded-l-xl border border-slate-700"
            placeholder="Add item..."
            placeholderTextColor="#64748b"
            value={newItemTitle}
            onChangeText={setNewItemTitle}
            onSubmitEditing={handleAddItem}
          />
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-r-xl justify-center"
            onPress={handleAddItem}
          >
            <Text className="text-white font-bold">Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
