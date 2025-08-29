const Tflite = require('react-native-tflite');
const tflite = new Tflite();

export const loadModel = () => {
  return new Promise<void>((resolve, reject) => {
    tflite.loadModel(
      {
        model: 'model_tfjs_converted.tflite',
        labels: 'labels.txt',
      },
      (err: string | null) => {
        if (err) {
          console.error('Model load error:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

export const runModelOnImage = (imagePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    tflite.runModelOnImage(
      {
        path: imagePath,
        imageMean: 127.5,
        imageStd: 127.5,
        numResults: 5,
        threshold: 0.1,
      },
      (err: string | null, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};