import { Platform } from "react-native";
import RNFS from "react-native-fs";
const Tflite = require("react-native-tflite");
const tflite = new Tflite();

// Characters your OCR model can recognize
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";

export const loadModel = () => {
  return new Promise<void>((resolve, reject) => {
    tflite.loadModel(
      {
        model: "model_tfjs_converted.tflite",
      },
      (err: string | null) => {
        if (err) {
          console.error("Model load error:", err);
          reject(err);
        } else {
          console.log("Model loaded successfully!");
          resolve();
        }
      }
    );
  });
};

/**
 * Preprocess the image before running inference
 * - Strip "file://" prefix if present
 * - (Optional) resize/convert to grayscale if needed by your model
 */
const preprocessImage = async (imagePath: string): Promise<string> => {
  let cleanPath = imagePath;
  if (Platform.OS === "android" && imagePath.startsWith("file://")) {
    cleanPath = imagePath.replace("file://", "");
  }

  // 👇 if you need resizing, you can use react-native-image-resizer
  // import ImageResizer from "react-native-image-resizer";
  // const resized = await ImageResizer.createResizedImage(cleanPath, 128, 32, "JPEG", 100);
  // cleanPath = resized.path;

  return cleanPath;
};

/**
 * Run inference on an image and return raw model results
 */
export const runModelOnImage = async (imagePath: string): Promise<any> => {
  try {
    const preprocessedPath = await preprocessImage(imagePath);

    return new Promise((resolve, reject) => {
      tflite.runModelOnImage(
        {
          path: preprocessedPath,
          imageMean: 127.5,
          imageStd: 127.5,
          numResults: 5,
          threshold: 0.1,
        },
        (err: string | null, res: any) => {
          if (err) {
            console.error("Inference error:", err);
            reject(err);
          } else {
            console.log("Raw model result:", res);
            resolve(res);
          }
        }
      );
    });
  } catch (e) {
    console.error("Preprocessing error:", e);
    throw e;
  }
};

/**
 * Decode model output into readable text
 * - If your model returns labels, just grab res[0].label
 * - If your model returns logits per timestep, apply greedy decoding
 */
export const decodeOutput = (results: any): string => {
  if (!results || results.length === 0) return "No text detected.";

  // Case 1: Model returns labels (e.g., MobileNet-style classification)
  if (results[0].label) {
    return results.map((r: any) => r.label).join(" ");
  }

  // Case 2: Model returns probability arrays per timestep
  // Example: results = [[0.1,0.8,0.1,...], [0.2,0.7,0.1,...], ...]
  let text = "";
  for (let timestep of results) {
    const maxIndex = timestep.indexOf(Math.max(...timestep));
    text += ALPHABET[maxIndex] || "";
  }

  // Clean up duplicates (common in CTC outputs)
  text = text.replace(/(.)\1+/g, "$1");

  return text.trim();
};

/**
 * Full OCR pipeline: preprocess → run model → decode
 */
export const runOCR = async (imagePath: string): Promise<string> => {
  try {
    const rawResults = await runModelOnImage(imagePath);
    const text = decodeOutput(rawResults);
    console.log("Decoded text:", text);
    return text;
  } catch (e) {
    console.error("OCR pipeline failed:", e);
    throw e;
  }
};
