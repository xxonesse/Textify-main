declare module "onnxruntime-react-native" {
  // Define supported ONNX tensor types
  export type OnnxTensorType = "float32" | "int32" | "uint8";
  
  // Define the allowed data types for tensors
  export type TypedArray = Float32Array | Int32Array | Uint8Array;

  // Tensor class used to feed data to the ONNX model
  export class Tensor {
    constructor(type: OnnxTensorType, data: TypedArray, dims: number[]);
    type: OnnxTensorType;
    data: TypedArray;
    dims: number[];
  }

  // Inference session class used to run the model
  export class InferenceSession {
    static create(path: string): Promise<InferenceSession>;
    run(feeds: Record<string, Tensor>): Promise<Record<string, Tensor>>;
  }
}
