import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Tags from "react-native-tags";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // ✅ Navigation hook

const LOCAL_IP = "192.168.179.139"; // ✅ Replace with your local IP

const UploadScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const navigation = useNavigation();

  // ✅ Load preferences from AsyncStorage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPreferences = await AsyncStorage.getItem("preferences");
        if (storedPreferences) {
          setPreferences(JSON.parse(storedPreferences));
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };
    loadPreferences();
  }, []);

  // ✅ Request permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera roll access is needed.");
      return false;
    }
    return true;
  };

  // ✅ Select Image from Gallery
  const selectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    } else {
      Alert.alert("No image selected");
    }
  };

  // ✅ Take a Picture using Camera
  const takePicture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    } else {
      Alert.alert("No picture taken");
    }
  };

  // ✅ Upload Image and Extract Materials
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert("No image selected");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "upload.jpg",
      });

      const response = await fetch(
        `http://${LOCAL_IP}:5000/api/images/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (response.ok) {
          Alert.alert("Upload Successful", "Materials Extracted!");

          // ✅ Set the extracted materials in the state
          setMaterials(data.materials || []);

          // ✅ Store the materials in localStorage
          await AsyncStorage.setItem(
            "materials",
            JSON.stringify(data.materials || [])
          );
        } else {
          Alert.alert("Upload Failed", data.message);
        }
      } else {
        const textResponse = await response.text();
        console.error("Unexpected response:", textResponse);
        Alert.alert("Error", "Unexpected server response. Check the console.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navigate to RecommendedCourses and send POST request
  const navigateToRecommendations = async () => {
    if (materials.length === 0 || preferences.length === 0) {
      Alert.alert("Missing Data", "Materials and preferences are required.");
      return;
    }

    try {
      const response = await fetch(
        `http://${LOCAL_IP}:5000/api/courses/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ materials, preferences }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to fetch courses");
        return;
      }

      // ✅ Navigate to RecommendedCourses with course data
      navigation.navigate("RecommendedCourses", {
        courses: data.filteredCourses,
      });
    } catch (error) {
      console.error("Error in recommendation:", error);
      Alert.alert("Error", "Failed to fetch recommended courses.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={selectImage}>
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.buttonText}>Take a Picture</Text>
        </TouchableOpacity>
      </View>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>
      )}

      {/* ✅ Display Materials as Tags */}
      {materials.length > 0 && (
        <View style={styles.tagContainer}>
          <Text style={styles.subtitle}>Extracted Materials:</Text>
          <Tags
            initialTags={materials}
            onChangeTags={(tags) => setMaterials(tags)}
            containerStyle={styles.tags}
            inputStyle={{ backgroundColor: "white" }}
            tagContainerStyle={styles.tag}
            tagTextStyle={styles.tagText}
          />

          <TouchableOpacity
            style={styles.viewCoursesButton}
            onPress={navigateToRecommendations} // ✅ Navigate on button click
          >
            <Text style={styles.buttonText}>View Recommended Courses</Text>
          </TouchableOpacity>
        </View>
      )}
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  viewCoursesButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
  },
  preview: {
    width: 300,
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
  },
  tagContainer: {
    width: "100%",
    marginTop: 20,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    justifyContent: "flex-start",
  },
  tag: {
    backgroundColor: "#FFD700",
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
  },
  tagText: {
    fontSize: 14,
    color: "#333",
  },
});

export default UploadScreen;
