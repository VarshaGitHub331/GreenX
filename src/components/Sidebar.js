import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Sidebar({ user, onClose }) {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "No token found");
        return;
      }

      // ✅ Call the logout API
      const response = await fetch(
        "http://192.168.179.139:5000/api/users/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // ✅ Clear AsyncStorage
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");

        Alert.alert("Success", "Logged out successfully!");
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } else {
        Alert.alert("Error", "Failed to log out");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  return (
    <View style={styles.sidebar}>
      {/* ✅ Header with User Info */}
      <View style={styles.header}>
        <Ionicons name="person-circle" size={60} color="#4CAF50" />
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <ScrollView>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Upload")}
        >
          <Ionicons name="camera" size={24} color="#4CAF50" />
          <Text style={styles.menuText}>Upload Waste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("CreateCourse")}
        >
          <Ionicons name="create" size={24} color="#4CAF50" />
          <Text style={styles.menuText}>Create DIY Course</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ViewPreferences")}
        >
          <Ionicons name="settings" size={24} color="#4CAF50" />
          <Text style={styles.menuText}>View Preferences</Text>
        </TouchableOpacity>

        {/* ✅ New: All Courses Navigation */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("AllCourses")}
        >
          <Ionicons name="book-outline" size={24} color="#4CAF50" />
          <Text style={styles.menuText}>All Courses</Text>
        </TouchableOpacity>

        {/* ✅ New: Creator Courses Navigation */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("MyCourses")}
        >
          <Ionicons name="person" size={24} color="#4CAF50" />
          <Text style={styles.menuText}>My Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={onClose}>
          <Ionicons name="close" size={24} color="#f44336" />
          <Text style={styles.menuText}>Close Menu</Text>
        </TouchableOpacity>

        {/* ✅ Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "70%",
    height: "100%",
    backgroundColor: "#fff",
    zIndex: 15,
    elevation: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: {
    fontSize: 18,
    color: "#4CAF50",
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53935",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 30,
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 10,
  },
});
