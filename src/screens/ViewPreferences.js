import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ViewPreferencesScreen = () => {
  const [userId, setUserId] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [allPreferences, setAllPreferences] = useState([
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
  ]);

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false); // ✅ Toggle edit mode
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const navigation = useNavigation();

  const LOCAL_IP = "192.168.179.139"; // ✅ Your local server IP

  // ✅ Load user and fetch preferences
  useEffect(() => {
    const loadUserAndPreferences = async () => {
      setLoading(true);

      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserId(user.id);

          // ✅ Fetch current preferences
          const response = await fetch(
            `http://${LOCAL_IP}:5000/api/users/${user.id}/preferences`
          );

          const data = await response.json();

          if (response.ok) {
            setPreferences(data.preferences || []);
            setSelectedPreferences(data.preferences || []);
          } else {
            Alert.alert("Error", data.message);
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        Alert.alert("Failed to load preferences.");
      } finally {
        setLoading(false);
      }
    };

    loadUserAndPreferences();
  }, []);

  // ✅ Toggle selection in edit mode
  const togglePreference = (item) => {
    if (selectedPreferences.includes(item)) {
      setSelectedPreferences((prev) => prev.filter((pref) => pref !== item));
    } else {
      setSelectedPreferences((prev) => [...prev, item]);
    }
  };

  // ✅ Save updated preferences
  const handleSave = async () => {
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
        Alert.alert("Preferences saved successfully!");

        // ✅ Update AsyncStorage with new preferences
        const storedUser = await AsyncStorage.getItem("user");
        const userData = JSON.parse(storedUser);
        const updatedUser = { ...userData, preferences: selectedPreferences };

        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

        // ✅ Reflect the changes
        setPreferences(selectedPreferences);
        setEditing(false);
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
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={editing ? allPreferences : preferences}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.preference,
                editing &&
                  selectedPreferences.includes(item) &&
                  styles.selected,
              ]}
              onPress={() => editing && togglePreference(item)}
            >
              <Text style={styles.preferenceText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ✅ Toggle Edit Mode */}
      <View style={styles.buttonContainer}>
        {editing ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setEditing(false);
                setSelectedPreferences(preferences);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.buttonText}>Edit Preferences</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  preference: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  selected: {
    backgroundColor: "#4CAF50",
    borderColor: "#388E3C",
  },
  preferenceText: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  editButton: {
    backgroundColor: "#4CAF50",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#FF6347",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ViewPreferencesScreen;
