import * as ort from "onnxruntime-react-native";
import { Platform } from "react-native";
import RNFS from "react-native-fs";

//Model Initialization & Path Handling
const copyModelToInternalStorage = async (): Promise<string> => {
  const modelAssetPath = "model.onnx";
  const targetDir = `${RNFS.DocumentDirectoryPath}/models`;
  const targetPath = `${targetDir}/model.onnx`;

  try {
    await RNFS.mkdir(targetDir);
    if (!(await RNFS.exists(targetPath))) {
      await RNFS.copyFileAssets(modelAssetPath, targetPath);
    }
    return targetPath;
  } catch (error) {
    console.error("Model copy failed:", error);
    throw error;
  }
};

const getModelPath = async (): Promise<string> => {
  return Platform.OS === "android"
    ? await copyModelToInternalStorage()
    : "model.onnx";
};

export const initializeModel = async (): Promise<void> => {
  try {
    await getModelPath();
    console.log("ONNX model initialized");
  } catch (error) {
    console.error("Model initialization failed:", error);
  }
};

//Image Preprocessing
export const preprocessImage = async (imagePath: string): Promise<ort.Tensor> => {
  const dummyData = new Float32Array(1 * 32 * 128 * 3).fill(0.5);
  return new ort.Tensor("float32", dummyData, [1, 32, 128, 3]);
};

//Output Decoding
const vocab = "z9k5ijq.EOTPr_LcFDyumotYKO-QJjd:BmPb8lMMH14s6'g7U11a3)pwcVHWGF\"GZvaxdh(szc";

const decodeOutput = (modelOutput: number[][][]): string => {
  let text = "";
  const [batchSize, seqLength] = [modelOutput.length, modelOutput[0].length];

  for (let s = 0; s < seqLength; s++) {
    const logits = modelOutput[0][s];
    const charIdx = logits.indexOf(Math.max(...logits));
    text += vocab[charIdx] || "";
  }

  return text.replace(/EOT.*/g, "").replace(/\s+/g, " ").trim();
};

//Inference Function
export const runOnnxModel = async (inputTensor: ort.Tensor): Promise<string | null> => {
  try {
    const modelPath = await getModelPath();
    const session = await ort.InferenceSession.create(modelPath);

    const outputMap = await session.run({ input: inputTensor });
    const output = outputMap.output;

    const data = Array.from(output.data as number[]);
    const [batchSize, seqLength, vocabSize] = output.dims;
    const reshapedOutput: number[][][] = [];

    let idx = 0;
    for (let b = 0; b < batchSize; b++) {
      const batch: number[][] = [];
      for (let s = 0; s < seqLength; s++) {
        batch.push(data.slice(idx, idx + vocabSize));
        idx += vocabSize;
      }
      reshapedOutput.push(batch);
    }

    return decodeOutput(reshapedOutput);
  } catch (error) {
    console.error("Error running ONNX model:", error);
    return null;
  }
};
