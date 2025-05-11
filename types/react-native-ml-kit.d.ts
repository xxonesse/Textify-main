declare module 'react-native-ml-kit/text-recognition' {
  const TextRecognition: {
    recognize: (imagePath: string) => Promise<any[]>; //  Use a more specific type if possible
  };
  export default TextRecognition;
}
