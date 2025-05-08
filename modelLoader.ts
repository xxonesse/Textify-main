import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export const loadModel = async (): Promise<InstanceType<typeof ort.InferenceSession>> => {
  let modelPath = 'model.onnx';

  if (Platform.OS === 'android') {
    const destPath = `${RNFS.DocumentDirectoryPath}/model.onnx`;

    const exists = await RNFS.exists(destPath);
    if (!exists) {
      // Copy model from android/app/src/main/assets/ to internal storage
      await RNFS.copyFileAssets('model.onnx', destPath);
    }

    modelPath = `file://${destPath}`; // Full file path required on Android
  }

  // Load the ONNX model
  const session = await ort.InferenceSession.create(modelPath);
  return session;
};
