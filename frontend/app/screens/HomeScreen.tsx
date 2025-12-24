import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { lists } from "../services/api";

export default function HomeScreen({
  onLogout,
  onListSelect,
}: {
  onLogout: () => void;
  onListSelect: (list: any) => void;
}) {
  const [todoLists, setTodoLists] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchLists = async () => {
    try {
      const response = await lists.getAll();
      setTodoLists(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLists();
    setRefreshing(false);
  };

  const handleCreate = async () => {
    if (!newTitle) return;
    try {
      await lists.create(newTitle);
      setNewTitle("");
      fetchLists(); // Refresh the list
    } catch (error) {
      Alert.alert("Error", "Could not create list");
    }
  };

  const handleDeleteList = async (listId: string) => {
    // Optimistic Update
    setTodoLists((prev) => prev.filter((l) => l.id !== listId));
    try {
      await lists.delete(listId);
    } catch (e) {
      Alert.alert("Error", "Could not delete list (Are you the owner?)");
      fetchLists(); // Revert on error
    }
  };
  const renderRightActions = (listId: string) => {
    return (
      <TouchableOpacity
        onPress={() => handleDeleteList(listId)}
        className="bg-red-600 justify-center items-center w-20 mb-3 rounded-r-xl"
      >
        <Text className="text-white font-bold">Delete</Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <View className="flex-1 bg-slate-900 px-4 pt-10">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-3xl font-bold">My Lists</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text className="text-red-400 font-bold">Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Create New List Input */}
      <View className="flex-row mb-6">
        <TextInput
          className="flex-1 bg-slate-800 text-white p-3 rounded-l-lg border border-slate-700"
          placeholder="New List Name..."
          placeholderTextColor="#64748b"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <TouchableOpacity
          className="bg-blue-600 p-3 rounded-r-lg justify-center"
          onPress={handleCreate}
        >
          <Text className="text-white font-bold">Add</Text>
        </TouchableOpacity>
      </View>

      {/* The List of Lists */}
      <FlatList
        data={todoLists}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff" // iOS Spinner Color
            colors={["#fff"]} // Android Spinner Color
          />
        }
        renderItem={({ item }) => (
          // 4. Wrap in Swipeable
          <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <TouchableOpacity
              onPress={() => onListSelect(item)}
              className="bg-slate-800 p-4 mb-3 rounded-xl border border-slate-700 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-white text-lg font-bold">
                  {item.title}
                </Text>
                <Text className="text-gray-400 text-xs">
                  Created: {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View className="bg-slate-700 w-8 h-8 rounded-full items-center justify-center">
                <Text className="text-gray-300">→</Text>
              </View>
            </TouchableOpacity>
          </Swipeable>
        )}
      />
    </View>
  );
}
