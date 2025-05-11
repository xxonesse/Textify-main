// src/screens/Scanner.tsx
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
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Make sure this matches your navigation setup
import { recognizeTextFromImage } from '../utils/mlkit';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Scanner'>;

const Scanner = () => {
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');

  const navigation = useNavigation<NavigationProp>();

  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === 'back');

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const cameraPermission = await Camera.requestCameraPermission();
        let storagePermission = false;

        if (Platform.OS === 'android') {
          const result = await PermissionsAndroid.requestMultiple([
            Platform.Version >= 33
              ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
              : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          ]);
          storagePermission = Object.values(result).every(
            r => r === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          storagePermission = result === RESULTS.GRANTED || result === RESULTS.LIMITED;
        }

        setHasPermission(cameraPermission === 'granted' && storagePermission);
      } catch (err) {
        console.error('Permission error:', err);
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

  const captureAndProcess = useCallback(async () => {
    if (!cameraRef.current || !device || !hasPermission) {
      Alert.alert('Error', 'Camera not ready or permissions not granted');
      return;
    }

    try {
      setLoading(true);

      const photo = await cameraRef.current.takePhoto({ flash: flashMode });
      const timestamp = Date.now();
      const newPath = `${RNFS.TemporaryDirectoryPath}/${timestamp}.jpg`;

      await RNFS.moveFile(photo.path, newPath);
      const exists = await RNFS.exists(newPath);
      if (!exists) throw new Error('Image file does not exist.');

      const uri = Platform.OS === 'android' ? `file://${newPath}` : newPath;

      const text = await recognizeTextFromImage(uri);

      try {
        await CameraRoll.save(newPath, { type: 'photo' });
      } catch (saveError) {
        console.warn('CameraRoll save error:', saveError);
      }

      navigation.navigate('Result', {
        imageUri: uri,
        detectedText: text || 'No text found.',
      });

    } catch (error) {
      console.error('Capture/Process error:', error);
      Alert.alert('Error', 'Failed to process image.', [
        { text: 'OK' },
        { text: 'Retry', onPress: captureAndProcess }
      ]);
    } finally {
      setLoading(false);
    }
  }, [device, hasPermission, flashMode, navigation]);

  const toggleFlash = () => {
    setFlashMode(prev => (prev === 'on' ? 'off' : 'on'));
  };

  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission not granted. Please enable it in your device settings.
        </Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => Linking.openSettings()}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={toggleFlash} style={[styles.button, styles.flashButton]}>
          <Text style={styles.buttonText}>Flash: {flashMode.toUpperCase()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={captureAndProcess}
          disabled={loading}
          style={[styles.button, styles.captureButton, loading && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Capture & Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 20 },
  settingsButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10 },
  camera: { width: '100%', aspectRatio: 3 / 4, borderRadius: 10, overflow: 'hidden' },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10, elevation: 5, alignItems: 'center' },
  captureButton: { backgroundColor: '#4CAF50', flex: 1, marginLeft: 10 },
  flashButton: { backgroundColor: '#2196F3' },
  disabledButton: { backgroundColor: '#cccccc' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  loadingContainer: { marginTop: 20, alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
});

export default Scanner;
