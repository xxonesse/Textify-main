import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Homescreen from "./src/screens/Homescreen";
import AddNoteScreen from "./src/screens/AddNoteScreen";
import Settingscreen from "./src/screens/Settingscreen";
import Scanner from "./src/screens/Scanner";
import LogInPage from "./src/screens/LogInscreen";
import SignInPage from "./src/screens/SignInscreen";

import { loadModel } from "./modelLoader"; // 👈 add this line
// import ResultScreen from "./src/screens/ResultScreen";

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
  useEffect(() => {
    const init = async () => {
      try {
        const session = await loadModel();
        console.log("Session loaded:", session);
      } catch (err) {
        console.error("Failed to load ONNX model:", err);
      }
    };
    init();
  }, []);
  

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="SignInPage">
        <Stack.Screen name="SignInPage" component={SignInPage} />
        <Stack.Screen name="LogInPage" component={LogInPage} />
        <Stack.Screen name="Home" component={Homescreen} />
        <Stack.Screen name="AddNote" component={AddNoteScreen} />
        <Stack.Screen name="Settings" component={Settingscreen} />
        <Stack.Screen name="Scanner" component={Scanner} />
        {/* <Stack.Screen name="Result" component={ResultScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
