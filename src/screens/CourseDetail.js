import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function CourseDetailsScreen({ route }) {
  const { course } = route.params;
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {course.title} - {course.creatorName}
      </Text>

      <Text style={styles.sectionHeader}>Materials</Text>
      <FlatList
        data={course.materials}
        renderItem={({ item }) => <Text style={styles.listItem}>- {item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />

      <Text style={styles.sectionHeader}>Preferences</Text>
      <FlatList
        data={course.preferences}
        renderItem={({ item }) => <Text style={styles.listItem}>- {item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />

      <Text style={styles.sectionHeader}>Steps</Text>
      {course.steps.map((step) => (
        <View key={step.step_number} style={styles.stepCard}>
          <Text style={styles.stepTitle}>Step {step.step_number}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontSize: 18,
    color: "#4CAF50",
    marginLeft: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  creator: {
    fontSize: 18,
    color: "#555",
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
  },
  listItem: {
    fontSize: 16,
    color: "#555",
  },
  stepCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    elevation: 4,
  },
});
