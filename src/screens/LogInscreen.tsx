import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { loginUser } from "../services/ocrServices"; // centralized API service

type RootStackParamList = {
  LogInPage: undefined;
  SignInPage: undefined;
  Home: { userName: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "LogInPage">;

export default function LogIn({ navigation }: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim() || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      await loginUser(name, password); // uses centralized API service
      navigation.navigate("Home", { userName: name }); // matches App.tsx
    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err.message);
      const message = err.response?.data?.detail || "Invalid username or password";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Image source={require("../assets/textify_logo.png")} style={styles.logo} />
          <Text style={styles.appTitle}>Texant</Text>
        </View>

        <View style={styles.input}>
          <TextInput
            placeholder="Username"
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            maxLength={20}
          />
          <TextInput
            placeholder="Password"
            style={styles.passwordInput}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            maxLength={30}
          />
          <Text style={styles.forgotPass}>Forgot Password?</Text>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#F1E9B2" />
            ) : (
              <Text style={styles.continueText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("SignInPage")}>
            <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1E9B2",
    paddingVertical: 20,
  },
  logo: {
    marginTop: -10,
    height: 95,
    width: 101,
    resizeMode: "contain",
  },
  appTitle: {
    fontStyle: "italic",
    fontFamily: "BeVietnamPro-Black",
    marginTop: 27,
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
  },
  input: {
    marginTop: 30,
    alignItems: "center",
    width: "100%",
  },
  textInput: {
    padding: 10,
    marginTop: 5,
    backgroundColor: "#F1E9B2",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 10,
    color: "#323232",
    width: "80%",
    height: 50,
    fontSize: 18,
  },
  passwordInput: {
    padding: 10,
    marginTop: 5,
    backgroundColor: "#F1E9B2",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 10,
    color: "#323232",
    width: "80%",
    height: 50,
    fontSize: 18,
  },
  continueButton: {
    marginTop: 15,
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "70%",
    alignItems: "center",
  },
  continueText: {
    color: "#F1E9B2",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  forgotPass: {
    alignSelf: "flex-end",
    marginRight: 50,
    marginTop: 5,
  },
  signUpText: {
    marginTop: 15,
    color: "#000",
    textDecorationLine: "underline",
  },
});
