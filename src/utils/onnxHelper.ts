import { InferenceSession, Tensor } from "onnxruntime-react-native";
import { Platform } from "react-native";

// Load ONNX model path based on platform
const getModelPath = () => {
  return Platform.OS === "android"
    ? "file:///android_asset/model.onnx"
    : "model.onnx";
};

// Preprocess the image (Placeholder - implement real preprocessing)
export const preprocessImage = async (imagePath: string) => {
  // 🚀 Use TensorFlow.js or OpenCV.js for proper preprocessing!
  console.log("Processing Image: ", imagePath);
  
  // Convert to tensor (dummy data for now)
  const dummyTensor = new Tensor("float32", new Float32Array(784), [1, 28, 28]); // Example: 28x28 grayscale
  return dummyTensor;
};

// Run inference with ONNX model
export const runOnnxModel = async (inputTensor: Tensor) => {
  try {
    const session = await InferenceSession.create(getModelPath());
    console.log("ONNX Model Loaded Successfully");

    const feeds = { input: inputTensor }; // Adjust "input" based on model input name
    const outputMap = await session.run(feeds);

    return outputMap.output.data; // Adjust "output" based on model output name
  } catch (error) {
    console.error("Error running ONNX model:", error);
    return null;
  }
};
