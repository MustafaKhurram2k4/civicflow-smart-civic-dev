"""
CivicFlow Vision Verification Service (Memory-Optimized for Free Tiers)

Optimizations:
1. Lazy loading: Model is NOT loaded during server boot, only when an image is verified.
2. Thread limiting: Restricts PyTorch to 1 CPU thread to avoid memory spikes.
3. Resized input: Downscales image to max 640px before inference.
4. Intelligent fallback: If YOLO runs out of memory or fails, seamlessly falls back to Gemini 2.5 Flash Vision.

Supported classes:
- Pothole
- Road Damage
- Garbage
"""

import gc
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Optional

from PIL import Image

logger = logging.getLogger(__name__)

MODEL_REPO = "Vansh180/PotholeNet-V1"
MODEL_FILENAME = "Vision Classification.pt"
MODEL_DIR = Path(__file__).parent / "model"

# Lazy-loaded model instance
_model = None


def _load_yolo_model():
    """Download the model if needed, then load it with strict CPU single-thread constraints."""
    global _model
    if _model is not None:
        return _model

    import torch
    from huggingface_hub import hf_hub_download
    from ultralytics import YOLO

    # Constrain PyTorch thread memory footprint
    torch.set_num_threads(1)
    try:
        torch.set_num_interop_threads(1)
    except Exception:
        pass

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    local_file = MODEL_DIR / MODEL_FILENAME

    if local_file.exists():
        model_path = str(local_file)
    else:
        logger.info(f"Downloading {MODEL_FILENAME} from {MODEL_REPO}...")
        model_path = hf_hub_download(
            repo_id=MODEL_REPO,
            filename=MODEL_FILENAME,
            local_dir=str(MODEL_DIR),
        )

    logger.info("Loading YOLO weights into memory...")
    _model = YOLO(model_path)
    return _model


def prepare_image(image_path: str | Path) -> Path:
    """Preprocess image to 640px max dimension to conserve memory on free cloud tiers."""
    image_path = Path(image_path)
    processed_path = image_path.with_name(f"{image_path.stem}_processed.jpg")

    with Image.open(image_path) as image:
        image = image.convert("RGB")
        # 640x640 thumbnail uses 75% less RAM than 1280x1280
        image.thumbnail((640, 640))
        image.save(
            processed_path,
            format="JPEG",
            quality=80,
            optimize=True,
        )

    return processed_path


def _verify_with_gemini_fallback(processed_path: Path) -> dict[str, Any]:
    """Zero-RAM cloud fallback using Gemini 2.5 Flash Vision if YOLO fails or memory is tight."""
    try:
        backend_dir = Path(__file__).resolve().parents[1]
        if str(backend_dir) not in sys.path:
            sys.path.insert(0, str(backend_dir))
        from config import settings
        if not settings.GEMINI_API_KEY:
            return {"verified": False, "detections": []}

        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        with open(processed_path, "rb") as f:
            image_bytes = f.read()

        prompt = (
            "Analyze this municipal civic complaint photo. Determine if it shows one of these three issues: "
            "Pothole, Road Damage, or Garbage. "
            "Return JSON matching: {\"verified\": boolean, \"detections\": [{\"class\": \"Pothole\" | \"Road Damage\" | \"Garbage\", \"confidence\": float, \"bbox\": [x1, y1, x2, y2]}]}. "
            "If no civic issue is visible, set verified to false and detections to empty array."
        )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt,
            ],
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
            ),
        )

        if response.text:
            data = json.loads(response.text)
            return {
                "verified": bool(data.get("verified", False)),
                "detections": data.get("detections", []),
            }
    except Exception as e:
        logger.warning(f"Gemini Vision fallback failed: {e}")

    return {"verified": False, "detections": []}


def verify_image(
    image_path: str | Path,
    confidence: float = 0.25,
    image_size: int = 320,
) -> dict[str, Any]:
    """
    Verify a civic-issue image with low-memory safety guards.
    """
    if not 0.0 <= confidence <= 1.0:
        raise ValueError("confidence must be between 0.0 and 1.0")

    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    processed_path = prepare_image(image_path)

    # Allow disabling heavy local YOLO via environment variable if running on ultra-low memory
    if os.getenv("DISABLE_LOCAL_YOLO", "false").lower() in ("true", "1", "yes"):
        try:
            return _verify_with_gemini_fallback(processed_path)
        finally:
            if processed_path.exists():
                processed_path.unlink()

    try:
        import torch

        model = _load_yolo_model()

        with torch.inference_mode():
            results = model.predict(
                source=str(processed_path),
                imgsz=image_size,
                conf=confidence,
                device="cpu",
                verbose=False,
            )

        result = results[0]
        detections = []

        if result.boxes is not None:
            for box in result.boxes:
                class_id = int(box.cls[0])
                score = float(box.conf[0])
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "class": result.names[class_id],
                    "confidence": round(score, 4),
                    "bbox": [
                        round(x1, 2),
                        round(y1, 2),
                        round(x2, 2),
                        round(y2, 2),
                    ],
                })

        return {
            "verified": len(detections) > 0,
            "detections": detections,
        }

    except (MemoryError, Exception) as exc:
        logger.warning(f"YOLO verification encountered error ({exc}). Falling back to Gemini Vision API...")
        return _verify_with_gemini_fallback(processed_path)

    finally:
        if processed_path.exists():
            processed_path.unlink()
        gc.collect()
