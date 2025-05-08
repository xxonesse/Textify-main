import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, PermissionsAndroid, Platform, Image, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import RNFS from 'react-native-fs';

const Scanner = () => {
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back'); // Find the back camera

  useEffect(() => {
    const requestPermissions = async () => {
      let permissionGranted = false;

      if (Platform.OS === 'android') {
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        permissionGranted = cameraPermission === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const status = await Camera.requestCameraPermission();
        permissionGranted = status === 'granted';
      }

      setHasPermission(permissionGranted);
    };

    requestPermissions();
  }, []);

  const captureAndProcess = async () => {
    if (!cameraRef.current) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePhoto();
      const filePath = `${RNFS.CachesDirectoryPath}/${Date.now()}.jpg`;

      await RNFS.moveFile(photo.path, filePath);
      setImageUri(filePath);

      // ⛔ Removed TextRecognition — Placeholder instead:
      setDetectedText('OCR not yet implemented');

      await CameraRoll.save(filePath, { type: 'photo' });
    } catch (error) {
      Alert.alert('Error', 'Failed to process image.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!device) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {!hasPermission ? (
        <Text style={{ fontSize: 18, color: 'red' }}>No Camera Permission</Text>
      ) : (
        <>
          <Camera ref={cameraRef} style={{ width: '100%', height: '60%' }} device={device} isActive={true} photo={true} />

          <TouchableOpacity
            onPress={captureAndProcess}
            style={{
              marginTop: 20,
              backgroundColor: 'white',
              padding: 10,
              borderRadius: 10,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 16, color: 'black' }}>Capture</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}
          {imageUri && (
            <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginTop: 10 }} />
          )}
          {detectedText && (
            <Text style={{ marginTop: 10, fontSize: 16, color: 'black' }}>
              {`Detected Text: ${detectedText}`}
            </Text>
          )}
        </>
      )}
    </View>
  );
};

export default Scanner;

// import React, { useRef, useState, useEffect } from "react";
// import {View, Button, StyleSheet, ActivityIndicator, Pressable, Image} from "react-native";
// import { Camera, useCameraDevices } from 'react-native-vision-camera';
// import TextRecognition from "@react-native-ml-kit/text-recognition";

// export default function Scanner({navigation}) {
//   const [permission, requestPermission] = useCameraPermissions();
//   const[isProcessing, setIsProcessing] = useState(false);
//   const [photoUri, setPhotoUri] = useState(null);
//   const cameraRef = useRef(null);

//   useEffect(()=> {
//     if(!permission?.granted) {
//       requestPermission();
//     }
//   }, [permission]);

//   const takePicture = async ()=> {
//     if(!cameraRef.current) return;

//     const photo = await cameraRef.current.takePictureAsync();
//     setPhotoUri(photo.uri);
//     setIsProcessing(true);

//     try {
//       const result - await TextRecognition.recognize(photo.uri);
//       navigation.navigate("Result", {text: ReadableStreamDefaultController.text});
//     } catch (err) {
//       navigation.navigate("Result", {text: "Error: " + JSON.stringify(err)});
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if(!permission?.granted) {
//     return (
//       <View style={styles.centered}>
//         <Button title="Request Camera Permission" onPress={requestPermission} />
//       </View>
//     )
//   }

//   return (
//     <View style={styles.container}>
//       {photoUri && isProcessing ? (
//         <Image source={{uri:photoUri}} style={styles.camera} resizeMode="cover" />
//       ) : (
//         <CameraView ref={cameraRef} style={styles.camera} facing="back" />
//       )}
//       <View style={styles.controls}>
//         {isProcessing && <ActivityIndicator size="large" color="888888" />}
//         <Pressable onPress={takePicture} style={StyleSheet.button}></Pressable>
//       </View>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {flex: 1},
//   camera: {flex: 1},
//   controls:{
//     position: "absolute",
//     bottom: 40,
//     width: "100%",
//     alignItems: "center"
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center"
//   },
//   button: {
//     backgroundColor: "white",
//     width: 75,
//     height: 75,
//     borderRadius: "50%",
//     borderWidth: 5,
//     borderColor: "#595a59";
//   }
// });