import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  Image,
  ActivityIndicator,
  Linking,
  StyleSheet
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const Scanner = () => {
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const devices = useCameraDevices();
  const device = devices.find((device) => device.position === 'back');

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        let cameraGranted = false;
        let storageGranted = false;

        const cameraPermission = await Camera.requestCameraPermission();
        cameraGranted = cameraPermission === 'granted';

        if (Platform.OS === 'android') {
          const storagePermission = await PermissionsAndroid.requestMultiple([
            Platform.Version >= 33
              ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
              : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
          storageGranted = Object.values(storagePermission).every(
            (result) => result === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          const photoLibraryPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          storageGranted = photoLibraryPermission === RESULTS.GRANTED || photoLibraryPermission === RESULTS.LIMITED;
        }

        setHasPermission(cameraGranted && storageGranted);
      } catch (error) {
        console.error('Permission error:', error);
        Alert.alert(
          'Permission Required',
          'Please enable camera and storage permissions in settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    return () => {
      if (imageUri) {
        const cleanUri = imageUri.replace('file://', '');
        RNFS.unlink(cleanUri).catch(console.warn);
      }
    };
  }, [imageUri]);

  const processDetectedText = useCallback((text: string) => {
    return text.replace(/\s+/g, ' ').trim();
  }, []);

  const captureAndProcess = useCallback(async () => {
    if (!cameraRef.current || !device || !hasPermission) {
      Alert.alert('Error', 'Camera not ready or permissions not granted');
      return;
    }

    try {
      setLoading(true);
      setImageUri(null);
      setDetectedText(null);

      const photo = await cameraRef.current.takePhoto({ flash: flashMode });
      const timestamp = Date.now();
      const newPath = `${RNFS.TemporaryDirectoryPath}/${timestamp}.jpg`;

      await RNFS.moveFile(photo.path, newPath);

      const fileExists = await RNFS.exists(newPath);
      if (!fileExists) {
        throw new Error('File not found after moving');
      }

      const displayUri = Platform.OS === 'android' ? `file://${newPath}` : newPath;
      setImageUri(displayUri);

      const recognizePath = Platform.OS === 'android' ? `file://${newPath}` : newPath;
      const result = await TextRecognition.recognize(recognizePath);
      const cleanedText = processDetectedText(result.text);
      setDetectedText(cleanedText);

      try {
        await CameraRoll.save(newPath, { type: 'photo' });
      } catch (saveError) {
        console.warn('CameraRoll save error:', saveError);
      }
    } catch (error) {
      console.error('Error in captureAndProcess:', error);
      Alert.alert(
        'Error',
        'Failed to process image. Please try again.',
        [
          { text: 'OK' },
          { text: 'Retry', onPress: captureAndProcess }
        ]
      );
    } finally {
      setLoading(false);
    }
  }, [device, hasPermission, flashMode, processDetectedText]);

  const toggleFlash = useCallback(() => {
    setFlashMode((prev) => (prev === 'off' ? 'on' : 'off'));
  }, []);

  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!hasPermission ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission not granted. Please enable it in your device settings.
          </Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => Linking.openSettings()}>
            <Text style={styles.buttonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Camera ref={cameraRef} style={styles.camera} device={device} isActive={true} photo={true} />

          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={toggleFlash} style={[styles.button, styles.flashButton]}>
              <Text style={styles.buttonText}>Flash: {flashMode === 'on' ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={captureAndProcess}
              disabled={loading}
              style={[styles.button, styles.captureButton, loading && styles.disabledButton]}
            >
              <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Capture & Scan'}</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Processing image...</Text>
            </View>
          )}

          {imageUri && (
            <View style={styles.imageContainer}>
              <Text style={styles.sectionTitle}>Captured Image:</Text>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
            </View>
          )}

          {detectedText && (
            <View style={styles.textContainer}>
              <Text style={styles.sectionTitle}>Detected Text:</Text>
              <Text style={styles.detectedText} numberOfLines={5} ellipsizeMode="tail">
                {detectedText}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  permissionContainer: { padding: 20, alignItems: 'center' },
  permissionText: { fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 20 },
  settingsButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  camera: { width: '100%', aspectRatio: 3 / 4, borderRadius: 10, overflow: 'hidden' },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20, alignItems: 'center' },
  button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10, elevation: 5, alignItems: 'center', justifyContent: 'center' },
  captureButton: { backgroundColor: '#4CAF50', flex: 1, marginLeft: 10 },
  flashButton: { backgroundColor: '#2196F3' },
  disabledButton: { backgroundColor: '#cccccc' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  loadingContainer: { marginTop: 20, alignItems: 'center' },
  loadingText: { textAlign: 'center', marginTop: 10, fontSize: 16 },
  imageContainer: { marginTop: 20, alignItems: 'center', width: '100%' },
  imagePreview: { width: '100%', aspectRatio: 1, borderRadius: 8, marginTop: 10 },
  textContainer: { marginTop: 20, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, width: '100%' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  detectedText: { fontSize: 16, color: '#333' },
});

export default Scanner;