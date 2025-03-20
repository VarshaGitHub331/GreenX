import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import UploadScreen from "../screens/UploadScreen";
import PreferencesScreen from "../screens/PreferencesScreen";
import ResultScreen from "../screens/ResultScreen";
import ViewPreferencesScreen from "../screens/ViewPreferences";
import CreateCourse from "../screens/CreateCourse";
import AllCoursesScreen from "../screens/AllCourses";
import MyCourses from "../screens/CreatorCourses";
import CourseDetailsScreen from "../screens/CourseDetail";
import RecommendedCourses from "../screens/Recommended";
const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home" component={HomeScreen}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="ViewPreferences" component={ViewPreferencesScreen} />
      <Stack.Screen name="Upload" component={UploadScreen} />
      <Stack.Screen name="CreateCourse" component={CreateCourse} />
      <Stack.Screen name="AllCourses" component={AllCoursesScreen} />
      <Stack.Screen name="MyCourses" component={MyCourses} />
      <Stack.Screen name="CourseDetail" component={CourseDetailsScreen} />
      <Stack.Screen name="RecommendedCourses" component={RecommendedCourses} />
    </Stack.Navigator>
  );
}
