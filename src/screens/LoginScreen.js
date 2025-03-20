import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Card,
} from "react-native-paper";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://192.168.179.139:5000/api/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message);
        return;
      }

      const data = await response.json();

      // ✅ Store the token and user details in AsyncStorage
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      Alert.alert("Success", "Logged in successfully!");
      navigation.replace("Home"); // Navigate to Menu after login
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Card style={styles.card}>
        <Card.Title title="Login" subtitle="Welcome back!" />
        <Card.Content>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {loading ? (
            <ActivityIndicator animating={true} color="#4CAF50" />
          ) : (
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
            >
              Login
            </Button>
          )}

          <Button
            mode="text"
            onPress={() => navigation.navigate("Register")}
            style={styles.registerButton}
          >
            Don't have an account? Register
          </Button>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  loginButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
  },
  registerButton: {
    marginTop: 10,
    color: "#1976D2",
  },
});

export default LoginScreen;
