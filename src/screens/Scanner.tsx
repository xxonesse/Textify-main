import React, { useState } from "react";
import { View, Button, Image } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { uploadImageForOCR } from "../services/ocrServices";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Scanner">;

const Scanner = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const takePhoto = () => {
    launchCamera({ mediaType: "photo", quality: 1 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  const pickFromGallery = () => {
    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  const handleUpload = async () => {
    if (!imageUri) return;
    const text = await uploadImageForOCR(imageUri);

    // ✅ Navigate to Result screen with image + OCR text
    navigation.navigate("Result", {
      imageUri,
      detectedText: text,
    });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="📸 Take Photo" onPress={takePhoto} />
      <Button title="🖼 Pick from Gallery" onPress={pickFromGallery} />

      {imageUri && (
        <>
          <Image
            source={{ uri: imageUri }}
            style={{ width: 200, height: 100, marginTop: 20 }}
          />
          <Button title="🔎 Run OCR" onPress={handleUpload} />
        </>
      )}
    </View>
  );
};

export default Scanner;
