import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, PermissionsAndroid, Platform, Image, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import RNFS from 'react-native-fs';
import { runOnnxModel, preprocessImage } from '../utils/onnxHelper'; // ✅ ONNX functions

const Scanner = () => {
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === 'back') ?? devices[0];

  useEffect(() => {
    (async () => {
      let permissionGranted = false;

      if (Platform.OS === 'android') {
        const cameraPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        const storagePermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        permissionGranted = cameraPermission === PermissionsAndroid.RESULTS.GRANTED && storagePermission === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const status = await Camera.requestCameraPermission();
        permissionGranted = status === 'granted';
      }

      setHasPermission(permissionGranted);
    })();
  }, []);

  const captureAndProcess = async () => {
    if (!cameraRef.current) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePhoto({});
      const filePath = `${RNFS.CachesDirectoryPath}/${Date.now()}.jpg`;

      // Move file for processing
      await RNFS.moveFile(photo.path, filePath);
      setImageUri(filePath); // Display captured image

      // Preprocess Image and Run ONNX Model
      const inputTensor = await preprocessImage(filePath);
      const text = await runOnnxModel(inputTensor);
      setDetectedText(text ? text.join(" ") : "No text detected");

      // Optional: Save to Gallery
      await CameraRoll.save(filePath, { type: 'photo' });
    } catch (error) {
      Alert.alert('Error', 'Failed to process image.');
      console.error(error);
    }
    setLoading(false);
  };

  if (!device) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>No camera found</Text>;
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {hasPermission ? (
        <>
          <Camera ref={cameraRef} style={{ width: "100%", height: "60%" }} device={device} isActive={true} photo={true} />
          <TouchableOpacity onPress={captureAndProcess} style={{ marginTop: 20, backgroundColor: 'white', padding: 10, borderRadius: 10 }}>
            <Text>Capture & Recognize</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginTop: 10 }} />}
          {detectedText && <Text style={{ marginTop: 10, fontSize: 16 }}>Detected Text: {detectedText}</Text>}
        </>
      ) : (
        <Text>No Camera Permission</Text>
      )}
    </View>
  );
};

export default Scanner;
