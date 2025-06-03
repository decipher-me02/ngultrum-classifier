from ultralytics import YOLO
from PIL import Image
import base64
import io
import numpy as np
import cv2

# Load model globally
model = YOLO("best.pt")

def decode_base64_image(b64_string):
    image_data = base64.b64decode(b64_string)
    return Image.open(io.BytesIO(image_data)).convert("RGB")

def encode_image_to_base64(cv_img):
    _, buffer = cv2.imencode('.jpg', cv_img)
    return base64.b64encode(buffer).decode("utf-8")
