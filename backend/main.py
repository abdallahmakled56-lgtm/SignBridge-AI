
from pathlib import Path
import io
import json
import os

import numpy as np
import tensorflow as tf
from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware


# ==========================================
# 1. Model paths
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = Path(
    os.getenv(
        "SIGNBRIDGE_MODEL_PATH",
        str(BASE_DIR / "model" / "signbridge_32_classes.keras"),
    )
)

CLASSES_PATH = Path(
    os.getenv(
        "SIGNBRIDGE_CLASSES_PATH",
        str(BASE_DIR / "model" / "class_names.json"),
    )
)


# ==========================================
# 2. FastAPI application
# ==========================================

app = FastAPI(
    title="SignBridge AI API",
    description="Arabic Sign Language Image Classification API",
    version="1.0.0",
)


# ==========================================
# 3. CORS configuration
# ==========================================

frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ==========================================
# 4. Load model and class names
# ==========================================

if not MODEL_PATH.is_file():
    raise FileNotFoundError(
        f"Model file not found: {MODEL_PATH}"
    )

if not CLASSES_PATH.is_file():
    raise FileNotFoundError(
        f"Class names file not found: {CLASSES_PATH}"
    )

print("Loading SignBridge AI model...")

model = tf.keras.models.load_model(MODEL_PATH)

with CLASSES_PATH.open("r", encoding="utf-8") as file:
    classes = json.load(file)

if not isinstance(classes, list):
    raise RuntimeError(
        "Class names file must contain a JSON list"
    )

if len(classes) != model.output_shape[-1]:
    raise RuntimeError(
        "Model output count does not match class names"
    )

print("Model loaded successfully!")
print(f"Number of classes: {len(classes)}")


# ==========================================
# 5. Home endpoint
# ==========================================

@app.get("/")
def home():
    return {
        "message": "SignBridge AI API is running",
        "number_of_classes": len(classes),
        "docs": "/docs",
    }


# ==========================================
# 6. Health check endpoint
# ==========================================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": True,
        "number_of_classes": len(classes),
    }


# ==========================================
# 7. Get available classes
# ==========================================

@app.get("/classes")
def get_classes():
    return {
        "classes": classes,
        "count": len(classes),
    }


# ==========================================
# 8. Predict sign from uploaded image
# ==========================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Upload a JPG, PNG, or WEBP image",
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty",
        )

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image must be smaller than 10 MB",
        )

    try:
        image = Image.open(
            io.BytesIO(contents)
        ).convert("RGB")

        image = image.resize((96, 96))

    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Could not read the uploaded image",
        )

    image_array = np.asarray(
        image,
        dtype=np.float32,
    )

    image_array = np.expand_dims(
        image_array,
        axis=0,
    )

    image_array = (
        tf.keras.applications.mobilenet_v2.preprocess_input(
            image_array
        )
    )

    predictions = model.predict(
        image_array,
        verbose=0,
    )[0]

    top_indices = np.argsort(predictions)[-3:][::-1]

    results = [
        {
            "class_name": classes[int(index)],
            "confidence": round(
                float(predictions[index]) * 100,
                2,
            ),
        }
        for index in top_indices
    ]

    return {
        "success": True,
        "predictions": results,
    }
