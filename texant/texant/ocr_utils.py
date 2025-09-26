import numpy as np
from PIL import Image
import tensorflow as tf
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load metadata
with open(os.path.join(BASE_DIR, "ocr_metadata.json"), "r", encoding="utf-8") as f:
    METADATA = json.load(f)

# Load the TFLite model once
interpreter = tf.lite.Interpreter(model_path=os.path.join(BASE_DIR, "ocr.tflite"))
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

def preprocess_image(image_path, width=256, height=64):
    """
    Convert image to grayscale, resize, normalize, and reshape
    """
    image = Image.open(image_path).convert("L")
    image = image.resize((width, height))
    img_array = np.array(image).astype(np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=-1)  # (H,W,1)
    img_array = np.expand_dims(img_array, axis=0)   # (1,H,W,1)
    return img_array

def decode_output(predictions, metadata):
    """
    Decode model logits into readable text using simple CTC-like decoding
    """
    charlist = metadata.get("charlist", [])
    logits = predictions[0]  # shape: (time_steps, num_classes)
    result = ""
    previous_idx = None
    for step in logits:
        idx = int(np.argmax(step))
        if idx != previous_idx and idx != 0:  # 0 = blank
            result += charlist[idx] if idx < len(charlist) else ""
        previous_idx = idx
    return result

def recognize_text(image_path):
    """
    Full pipeline: preprocess -> run TFLite -> decode -> return text
    """
    input_data = preprocess_image(image_path)
    interpreter.set_tensor(input_details[0]["index"], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]["index"])
    return decode_output(output_data, METADATA)
