import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import RNFS from 'react-native-fs';

const Scanner = () => {
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
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

  const captureAndSave = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePhoto({});
      const filePath = `${RNFS.CachesDirectoryPath}/${Date.now()}.jpg`;

      await RNFS.moveFile(photo.path, filePath);
      await CameraRoll.save(filePath, { type: 'photo' });

      Alert.alert('Success', 'Photo saved to gallery!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo.');
      console.error(error);
    }
  };

  if (!device) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>No camera found</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {hasPermission ? (
        <>
          <Camera ref={cameraRef} style={{ flex: 1 }} device={device} isActive={true} photo={true} />
          <TouchableOpacity onPress={captureAndSave} style={{ position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: 'white', padding: 10 }}>
            <Text>Capture</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>No Camera Permission</Text>
      )}
    </View>
  );
};

export default Scanner;
