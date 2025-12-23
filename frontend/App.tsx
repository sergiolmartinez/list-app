import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import LoginScreen from "./app/screens/LoginScreen";
import HomeScreen from "./app/screens/HomeScreen";
import ListDetailScreen from "./app/screens/ListDetailScreen";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState<any>(null);

  // Check if we are already logged in when the app starts
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await SecureStore.getItemAsync("user_token");
    setIsAuthenticated(!!token);
    setLoading(false);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("user_token");
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView
          className="flex-1 bg-slate-900"
          edges={["top", "left", "right"]}
        >
          {!isAuthenticated ? (
            <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
          ) : activeList ? (
            <ListDetailScreen
              list={activeList}
              onBack={() => setActiveList(null)}
            />
          ) : (
            <HomeScreen
              onLogout={handleLogout}
              onListSelect={(list) => setActiveList(list)}
            />
          )}
          <StatusBar style="light" />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
