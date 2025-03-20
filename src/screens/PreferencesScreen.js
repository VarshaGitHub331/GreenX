import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const PreferencesScreen = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [loading, setLoading] = useState(false);

  const LOCAL_IP = "192.168.179.139";

  // ✅ Waste Transformation Methods
  const preferences = [
    "Recycling",
    "Incineration",
    "Composting",
    "Upcycling",
    "Biogas Production",
    "Waste-to-Energy",
    "Plastic Bricks",
    "Vermicomposting",
    "Metal Recovery",
    "Paper Pulping",
  ];

  // ✅ Load user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserId(parsedUser.id);
        } else {
          Alert.alert("Error", "No user found. Please register.");
          navigation.navigate("Register");
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  // ✅ Toggle preferences
  const togglePreference = (item) => {
    setSelectedPreferences((prev) =>
      prev.includes(item)
        ? prev.filter((pref) => pref !== item)
        : [...prev, item]
    );
  };

  // ✅ Save preferences
  const handleSavePreferences = async () => {
    if (selectedPreferences.length === 0) {
      Alert.alert("Please select at least one preference.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://${LOCAL_IP}:5000/api/users/${userId}/preferences`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ preferences: selectedPreferences }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // ✅ Store updated preferences in AsyncStorage
        const storedUser = await AsyncStorage.getItem("user");
        const userData = JSON.parse(storedUser);
        const updatedUser = { ...userData, preferences: selectedPreferences };

        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

        Alert.alert("Preferences saved successfully!");

        // ✅ Navigate to Home
        navigation.reset({
          index: 0,
          routes: [{ name: "Home", params: { user: updatedUser } }],
        });
      } else {
        Alert.alert("Failed to save preferences", data.message);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Network error", "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Waste Transformation Methods</Text>

      {preferences.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.preference,
            selectedPreferences.includes(item) && styles.selected,
          ]}
          onPress={() => togglePreference(item)}
        >
          <Text style={styles.preferenceText}>{item}</Text>
        </TouchableOpacity>
      ))}

      {/* ✅ Themed Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSavePreferences}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  preference: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  selected: {
    backgroundColor: "#4CAF50",
    borderColor: "#388E3C",
  },
  preferenceText: {
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: "#4CAF50", // Green Theme
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    width: "100%",
  },
  saveButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PreferencesScreen;
