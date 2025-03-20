import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const LOCAL_IP = "192.168.179.139"; // Replace with your local IP

export default function CreateCourseScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [materials, setMaterials] = useState("");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [creatorName, setCreatorName] = useState("");

  // ✅ Fetch `user` object from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setCreatorId(user.id); // ✅ Extract `id` from `user`
          setCreatorName(user.name); // ✅ Extract `name` from `user`
        } else {
          console.warn("No user data found in AsyncStorage.");
        }
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    };

    loadUserData();
  }, []);

  // ✅ Handle Form Submission
  const handleSubmit = async () => {
    if (!title || !materials || !preferences) {
      Alert.alert("Missing Fields", "Please fill all the fields.");
      return;
    }

    if (!creatorId || !creatorName) {
      Alert.alert("Missing Creator Info", "Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `http://${LOCAL_IP}:5000/api/courses/create`,
        {
          title,
          materials: materials.split(","),
          preferences: preferences.split(","),
          creatorId, // ✅ Send creatorId dynamically
          creatorName, // ✅ Send creatorName dynamically
        }
      );

      const createdCourse = response.data.course;

      // ✅ Store the created course locally
      await AsyncStorage.setItem(
        "createdCourse",
        JSON.stringify(createdCourse)
      );

      setCourse(createdCourse);
      Alert.alert("Success", "DIY Course created successfully!");
    } catch (err) {
      console.error("Error creating course:", err);
      setError("Failed to create the course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset Form to Create a New Course
  const resetForm = () => {
    setCourse(null);
    setTitle("");
    setMaterials("");
    setPreferences("");
    setError("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {!course ? (
          <View style={styles.formWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter Course Title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Materials (comma separated)"
              value={materials}
              onChangeText={setMaterials}
            />

            <TextInput
              style={styles.input}
              placeholder="Preferences (comma separated)"
              value={preferences}
              onChangeText={setPreferences}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Generating..." : "Generate Course"}
              </Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#4CAF50" />}
            {error && <Text style={styles.error}>{error}</Text>}
          </View>
        ) : (
          // ✅ Display Course with Creator Info
          <ScrollView contentContainerStyle={styles.courseScroll}>
            <View style={styles.courseContainer}>
              <Text style={styles.courseTitle}>{course.title}</Text>

              <Text style={styles.courseDescription}>{course.description}</Text>

              {/* ✅ Materials Section */}
              <Text style={styles.subHeader}>🛠️ Materials</Text>
              <FlatList
                data={course.materials}
                renderItem={({ item }) => (
                  <Text style={styles.listItem}>- {item}</Text>
                )}
                keyExtractor={(item, index) => index.toString()}
              />

              {/* ✅ Preferences Section */}
              <Text style={styles.subHeader}>🔥 Preferences</Text>
              <FlatList
                data={course.preferences}
                renderItem={({ item }) => (
                  <Text style={styles.listItem}>- {item}</Text>
                )}
                keyExtractor={(item, index) => index.toString()}
              />

              {/* ✅ Steps Section */}
              <Text style={styles.subHeader}>📚 Steps</Text>
              {course.steps.map((step) => (
                <View key={step.step_number} style={styles.stepCard}>
                  <Text style={styles.stepTitle}>Step {step.step_number}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  <Text style={styles.tools}>
                    Tools: {step.tools_needed.join(", ")}
                  </Text>
                </View>
              ))}

              {/* ✅ Tips Section */}
              <Text style={styles.subHeader}>💡 Tips</Text>
              <FlatList
                data={course.tips}
                renderItem={({ item, index }) => (
                  <Text key={index} style={styles.tip}>
                    - {item}
                  </Text>
                )}
                keyExtractor={(item, index) => index.toString()}
              />

              <TouchableOpacity style={styles.greenButton} onPress={resetForm}>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.buttonText}> Create New Course</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  formWrapper: {
    width: "100%",
    maxWidth: 500,
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    alignSelf: "center",
    marginBottom: 30,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  courseScroll: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  courseContainer: {
    backgroundColor: "#fff",
    padding: 40, // 🛠️ Increased padding for spacious look
    borderRadius: 20, // 🛠️ Rounded corners for elegance
    marginBottom: 15,
    elevation: 12, // 🛠️ Higher shadow elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  courseTitle: {
    fontSize: 15, // 🛠️ Bigger, bolder title
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 15,
    textAlign: "center",
  },
  creator: {
    fontSize: 18,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },
  courseDescription: {
    fontSize: 18,
    color: "#444",
    lineHeight: 28, // 🛠️ Improved readability
    marginBottom: 25,
    textAlign: "justify",
  },
  subHeader: {
    fontSize: 22, // 🛠️ Larger section headers
    fontWeight: "bold",
    color: "#333",
    marginTop: 25,
    marginBottom: 15,
    textAlign: "left",
  },
  listItem: {
    fontSize: 18,
    color: "#555",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 8,
  },
  stepCard: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  tools: {
    fontSize: 16,
    color: "#777",
    marginTop: 5,
    fontStyle: "italic",
  },
  tip: {
    fontSize: 18,
    color: "#444",
    lineHeight: 24,
    paddingVertical: 8,
  },
  greenButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 30,
    elevation: 5,
  },
});
