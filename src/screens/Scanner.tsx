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
import { Camera, useCameraDevices, CameraDevice } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import TextRecognition from '@react-native-ml-kit/text-recognition';

const Scanner = () => {
  // Refs and state
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');

  // Camera devices
  const devices = useCameraDevices();
  const device = devices.find((device) => device.position === 'back');

  // Request permissions
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        let cameraGranted = false;
        let storageGranted = false;

        // Request camera permission
        const cameraPermission = await Camera.requestCameraPermission();
        cameraGranted = cameraPermission === 'granted';

        // Handle platform-specific storage permissions
        if (Platform.OS === 'android') {
          if (Platform.Version >= 33) {
            storageGranted = (await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            )) === PermissionsAndroid.RESULTS.GRANTED;
          } else {
            storageGranted = (await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            )) === PermissionsAndroid.RESULTS.GRANTED;
          }
        } else {
          // iOS photo library permission
          const iosStoragePermission = await CameraRoll.requestPhotosPermissions();
          storageGranted = iosStoragePermission === 'granted' || iosStoragePermission === 'limited';
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

  // Cleanup temporary files
  useEffect(() => {
    return () => {
      if (imageUri) {
        const cleanUri = imageUri.replace('file://', '');
        RNFS.unlink(cleanUri).catch(console.warn);
      }
    };
  }, [imageUri]);

  // Process detected text
  const processDetectedText = (text: string) => {
    // Remove excessive whitespace and clean up text
    return text
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Capture and process image
  const captureAndProcess = useCallback(async () => {
    if (!cameraRef.current || !device || !hasPermission) {
      Alert.alert('Error', 'Camera not ready or permissions not granted');
      return;
    }

    try {
      setLoading(true);
      setImageUri(null);
      setDetectedText(null);

      // Capture photo
      const photo = await cameraRef.current.takePhoto({
        flash: flashMode,
        qualityPrioritization: 'balanced'
      });

      const timestamp = Date.now();
      const newPath = `${RNFS.TemporaryDirectoryPath}/${timestamp}.jpg`;

      // Move file to temporary directory
      await RNFS.moveFile(photo.path, newPath);
      
      // Verify file exists
      const fileExists = await RNFS.exists(newPath);
      if (!fileExists) {
        throw new Error('File not found after moving');
      }

      // Set image URI for preview
      const displayUri = Platform.OS === 'android' ? `file://${newPath}` : newPath;
      setImageUri(displayUri);

      // Perform text recognition
      const result = await TextRecognition.recognize(newPath);
      const cleanedText = processDetectedText(result.text);
      setDetectedText(cleanedText);

      // Save to gallery
      try {
        const savePath = Platform.OS === 'android' ? `file://${newPath}` : newPath;
        await CameraRoll.save(savePath, { type: 'photo' });
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
  }, [device, hasPermission, flashMode]);

  // Toggle flash mode
  const toggleFlash = () => {
    setFlashMode(prev => prev === 'off' ? 'on' : 'off');
  };

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
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.buttonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={true}
            photo={true}
          />

          <View style={styles.controlsContainer}>
            <TouchableOpacity
              onPress={toggleFlash}
              style={[styles.button, styles.flashButton]}
            >
              <Text style={styles.buttonText}>
                Flash: {flashMode === 'on' ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={captureAndProcess}
              disabled={loading}
              style={[
                styles.button, 
                styles.captureButton,
                loading && styles.disabledButton
              ]}
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

          {imageUri && (
            <View style={styles.imageContainer}>
              <Text style={styles.sectionTitle}>Captured Image:</Text>
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
            </View>
          )}

          {detectedText && (
            <View style={styles.textContainer}>
              <Text style={styles.sectionTitle}>Detected Text:</Text>
              <Text 
                style={styles.detectedText} 
                numberOfLines={5} 
                ellipsizeMode="tail"
              >
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  permissionContainer: {
    padding: 20,
    alignItems: 'center'
  },
  permissionText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20
  },
  settingsButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  camera: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 10,
    overflow: 'hidden'
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    alignItems: 'center'
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 10
  },
  flashButton: {
    backgroundColor: '#2196F3'
  },
  disabledButton: {
    backgroundColor: '#cccccc'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%'
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginTop: 10
  },
  textContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  detectedText: {
    fontSize: 16,
    color: '#333'
  }
});

export default Scanner;