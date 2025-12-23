import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { auth } from "../services/api";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen({
  onLoginSuccess,
}: {
  onLoginSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // New State: Toggle between Login and Signup modes
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        // --- LOGIN FLOW ---
        const response = await auth.login({ email, password });
        await SecureStore.setItemAsync(
          "user_token",
          response.data.access_token
        );
        onLoginSuccess();
      } else {
        // --- SIGNUP FLOW ---
        // 1. Create the user
        await auth.signup({ email, password });

        // 2. Auto-login immediately to get the token
        const loginResponse = await auth.login({ email, password });
        await SecureStore.setItemAsync(
          "user_token",
          loginResponse.data.access_token
        );

        Alert.alert("Welcome!", "Account created successfully.");
        onLoginSuccess();
      }
    } catch (error: any) {
      console.log(error);
      const message = isLoginMode
        ? "Login failed. Check your credentials."
        : "Signup failed. Email might be taken.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-900 justify-center px-6"
    >
      <View>
        <Text className="text-white text-4xl font-bold mb-2">
          {isLoginMode ? "Welcome Back." : "Create Account."}
        </Text>
        <Text className="text-gray-400 text-lg mb-8">
          {isLoginMode
            ? "Sign in to continue."
            : "Join to start collaborating."}
        </Text>

        <TextInput
          className="bg-slate-800 text-white p-4 rounded-lg mb-4 border border-slate-700"
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          className="bg-slate-800 text-white p-4 rounded-lg mb-8 border border-slate-700"
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Main Action Button */}
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-lg items-center mb-6"
          onPress={handleAuth}
          disabled={loading}
        >
          <Text className="text-white font-bold text-lg">
            {loading ? "Please wait..." : isLoginMode ? "Log In" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* Toggle Button */}
        <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
          <Text className="text-blue-400 text-center font-semibold">
            {isLoginMode
              ? "Don't have an account? Sign Up"
              : "Already have an account? Log In"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
