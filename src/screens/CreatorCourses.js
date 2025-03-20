import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const LOCAL_IP = "192.168.179.139"; // Replace with your local IP

export default function MyCourses({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCreatorCourses = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (!userData) {
          console.warn("No user data found.");
          return;
        }

        const user = JSON.parse(userData);
        const response = await axios.get(
          `http://${LOCAL_IP}:5000/api/courses/creator/${user.id}`
        );

        setCourses(response.data.courses);
      } catch (error) {
        console.error("Error fetching creator courses:", error);
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorCourses();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ScrollView>
          <FlatList
            data={courses}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.courseCard}
                onPress={() =>
                  navigation.navigate("CourseDetail", { course: item })
                }
              >
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.description}>
                  {item.description.slice(0, 100)}...
                </Text>
                <Ionicons name="chevron-forward" size={24} color="#4CAF50" />
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  courseCard: {
    backgroundColor: "#fff",
    padding: 25,
    marginVertical: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
  },
  error: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
