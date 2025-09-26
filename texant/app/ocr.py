# ocr.py
import cv2
import numpy as np
import yaml
from pathlib import Path
from django.core.files.uploadedfile import InMemoryUploadedFile

try:
    from mltu.inferenceModel import OnnxInferenceModel
    from mltu.utils.text_utils import ctc_decoder
    from mltu.transformers import ImageResizer
    MODEL_AVAILABLE = True
except Exception as e:
    print("OCR dependencies missing or failed:", e)
    MODEL_AVAILABLE = False

_model = None

def enhance_image(image: np.ndarray) -> np.ndarray:
    # ... keep your enhancement code ...
    return image

class ImageToWordModel:
    def __init__(self, char_list=None, *args, **kwargs):
        if not MODEL_AVAILABLE:
            raise RuntimeError("OCR model not available")
        # ... your existing init ...

    def predict(self, image: np.ndarray) -> str:
        if not MODEL_AVAILABLE:
            return "[OCR unavailable]"
        # ... existing prediction code ...

def load_model() -> ImageToWordModel:
    global _model
    if not MODEL_AVAILABLE:
        return None
    if _model is None:
        try:
            configs_path = Path(__file__).resolve().parent / "texantmodel/configs.yaml"
            with open(configs_path, "r", encoding="utf-8") as f:
                configs = yaml.safe_load(f)
            model_path = Path(__file__).resolve().parent / "texantmodel/model.onnx"
            _model = ImageToWordModel(model_path=str(model_path), char_list=configs["vocab"])
        except Exception as e:
            print("Failed to load OCR model:", e)
            _model = None
    return _model

def run_ocr_from_file(file: InMemoryUploadedFile) -> str:
    if not MODEL_AVAILABLE:
        return "[OCR unavailable]"
    model = load_model()
    if not model:
        return "[OCR unavailable]"
    file_bytes = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if image is None:
        return "[Invalid image]"
    try:
        return model.predict(image)
    except Exception as e:
        return f"[OCR failed: {e}]"
