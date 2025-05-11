import TextRecognition from '@react-native-ml-kit/text-recognition';

// Define the structure of the result from TextRecognition
interface RecognitionBlock {
  text: string;
  // Add any other fields that might be in the result, like 'confidence', 'boundingBox', etc.
}

export const recognizeTextFromImage = async (imagePath: string): Promise<string> => {
  try {
    const result = await TextRecognition.recognize(imagePath);
    return result.text;
  } catch (error) {
    console.error('Text recognition failed:', error);
    return '';
  }
};
