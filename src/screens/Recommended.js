import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const RecommendedCourses = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { courses } = route.params;

  // ✅ Handle case where no courses are found
  if (!courses || courses.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noCoursesText}>No recommended courses found.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Recommended Courses</Text>

      <FlatList
        data={courses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Course Image */}
            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            )}

            {/* Course Title */}
            <Text style={styles.courseTitle}>{item.title}</Text>

            {/* Course Description */}
            <Text style={styles.courseDescription}>{item.description}</Text>

            {/* Difficulty Level */}
            <Text style={styles.difficulty}>Difficulty: {item.difficulty}</Text>

            {/* Tools Required */}
            <View style={styles.toolsContainer}>
              <Text style={styles.sectionTitle}>Tools:</Text>
              <FlatList
                data={item.tools}
                horizontal
                keyExtractor={(tool, index) => index.toString()}
                renderItem={({ item: tool }) => (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{tool}</Text>
                  </View>
                )}
              />
            </View>

            {/* Steps */}
            <View style={styles.stepsContainer}>
              <Text style={styles.sectionTitle}>Steps:</Text>
              {item.steps.map((step, index) => (
                <View key={index} style={styles.step}>
                  <Text style={styles.stepNumber}>
                    Step {step.step_number}:
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  <Text style={styles.toolsNeeded}>
                    Tools Needed: {step.tools_needed.join(", ")}
                  </Text>
                </View>
              ))}
            </View>

            {/* Tips */}
            {item.tips && item.tips.length > 0 && (
              <View style={styles.tipsContainer}>
                <Text style={styles.sectionTitle}>Tips:</Text>
                {item.tips.map((tip, index) => (
                  <Text key={index} style={styles.tip}>
                    - {tip}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Upload</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5,
  },
  courseDescription: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  difficulty: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 10,
  },
  toolsContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  tag: {
    backgroundColor: "#FFD700",
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  tagText: {
    fontSize: 14,
    color: "#333",
  },
  stepsContainer: {
    marginTop: 10,
  },
  step: {
    marginBottom: 15,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF5733",
  },
  stepDescription: {
    fontSize: 14,
    color: "#555",
  },
  toolsNeeded: {
    fontSize: 12,
    color: "#777",
  },
  tipsContainer: {
    marginTop: 10,
  },
  tip: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  noCoursesText: {
    fontSize: 18,
    color: "#FF0000",
    textAlign: "center",
    marginTop: 50,
  },
  backButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});

export default RecommendedCourses;
