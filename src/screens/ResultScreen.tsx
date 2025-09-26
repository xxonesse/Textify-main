import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import Clipboard from "@react-native-clipboard/clipboard";

type ResultScreenRouteProp = RouteProp<RootStackParamList, "Result">;

const ResultScreen = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const { imageUri, detectedText } = route.params;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const copyToClipboard = () => {
    Clipboard.setString(detectedText);
    Alert.alert("Copied ✅", "Detected text has been copied to clipboard!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* OCR Text */}
      <Text style={styles.title}>📝 Detected Text:</Text>
      <Text style={styles.text}>
        {detectedText.trim() ? detectedText : "No text detected"}
      </Text>

      {/* Captured Image */}
      {imageUri && (
        <>
          <Text style={styles.title}>📷 Captured Image:</Text>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </>
      )}

      {/* Actions */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>🏠 Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={copyToClipboard}>
          <Text style={styles.buttonText}>📋 Copy Text</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  text: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
    color: "#333",
  },
  image: { width: "100%", height: 300, borderRadius: 10, marginTop: 10 },
  buttonContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    marginBottom: 12,
    width: "80%",
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    width: "80%",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ResultScreen;
