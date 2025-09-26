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
import { registerUser } from "../services/ocrServices"; // centralized API service

type RootStackParamList = {
  SignInPage: undefined;
  Home: { userName: string };
  LogInPage: undefined; // ✅ fixed to match App.tsx
};

type Props = NativeStackScreenProps<RootStackParamList, "SignInPage">;

export default function SignInPage({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerUser(name, email, password); // auto-login included
      navigation.navigate("Home", { userName: name });
    } catch (err: any) {
      console.error("Registration/Login failed:", err.response?.data || err.message);

      const message =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        "Unable to register. Try a different username or email.";
      Alert.alert("Registration Failed", message);
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
            placeholderTextColor="#323232"
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            maxLength={20}
          />
          <TextInput
            placeholder="E-mail"
            placeholderTextColor="#323232"
            style={styles.textInput}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#323232"
            style={styles.passwordInput}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            maxLength={30}
          />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#323232"
            style={styles.passwordInput}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            maxLength={30}
          />

          <Text style={styles.forgotPass}>Forgot Password?</Text>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#F1E9B2" />
            ) : (
              <Text style={styles.continueText}>Register</Text>
            )}
          </TouchableOpacity>

          <Text style={{ marginTop: 10 }}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("LogInPage")}>
            <Text style={styles.login}>Log In</Text>
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
    marginLeft: 200,
    marginTop: 5,
  },
  login: {
    color: "#000",
    marginTop: 5,
  },
});
