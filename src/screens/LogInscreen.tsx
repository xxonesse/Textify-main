import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Define navigation props
type RootStackParamList = {
  LogInPage: undefined;
  Home: { userName: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "LogInPage">;

export default function LogIn({ navigation }: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleContinue = () => {
    if (name.trim()) {
      navigation.navigate("Home", { userName: name });
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Image source={require("../assets/textify_logo.png")} style={styles.logo} />
        <Text style={styles.appTitle}>Textify</Text>
      </View>
      <View style={styles.input}>
        {/* Username */}
        <TextInput
          placeholder="Username"
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          maxLength={20}
        />
        {/* Set Password */}
        <TextInput
          placeholder="Password"
          style={styles.passwordInput}
          secureTextEntry = {true}
          value={password}
          onChangeText={setPassword}
          maxLength={30}
        />
        <Text style={styles.forgotPass}>Forgot Password?</Text>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Log In</Text>
        </TouchableOpacity>

        <Text style={styles.signIn}>Don't have an account? Sign In</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    marginTop: -10,
    height: 95,
    width: 101,
    resizeMode: "contain",
  },
  appTitle: {
    fontStyle: 'italic',
    fontFamily: "BeVietnamPro-Black",
    marginTop: 27,
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
  },
  input: {
    marginTop: "20%",
    alignItems: "center",
    width: "100%",
  },
  enterName: {
    fontSize: 15,
    fontWeight: "700",
  },
  textInput: {
    padding: 10,
    marginTop: 5,
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 10,
    color: "#000",
    width: "80%",
    height: 50,
    fontSize: 18,
  },
  passwordInput: {
    padding: 10,
    marginTop: 5,
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 10,
    color: "#000",
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
    width: "70%"
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center"
  },
  forgotPass: {
    marginLeft: 200,
  },
  signIn: {
   marginTop: 10
  }
});
