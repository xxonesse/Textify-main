import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Homescreen from "./src/screens/Homescreen";
import AddNoteScreen from "./src/screens/AddNoteScreen";
import Settingscreen from "./src/screens/Settingscreen";
import Scanner from "./src/screens/Scanner";
import LogInPage from "./src/screens/LogInscreen";  // ✅ Fixed import path
import SignInPage from "./src/screens/SignInscreen";

// Define Stack Navigator with proper type safety
type RootStackParamList = {
  SignInPage: undefined;
  LogInPage: undefined;
  Home: undefined;
  AddNote: undefined;
  Settings: undefined;
  Scanner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="SignInPage">
        <Stack.Screen name="SignInPage" component={SignInPage} />
        <Stack.Screen name="LogInPage" component={LogInPage} />
        <Stack.Screen name="Home" component={Homescreen} />
        <Stack.Screen name="AddNote" component={AddNoteScreen} />
        <Stack.Screen name="Settings" component={Settingscreen} />
        <Stack.Screen name="Scanner" component={Scanner} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
