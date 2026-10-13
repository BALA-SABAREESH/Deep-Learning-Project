import os
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from ..services.yolo_detector import SafetyDetector
from ..services.video_processor import VideoProcessor

router = APIRouter()

# Initialize detector and video processor once on module load
weights_path = os.environ.get("PPE_MODEL_PATH", "backend/weights/ppe_best.pt")
fallback_model = os.environ.get("FALLBACK_MODEL", "yolov8n.pt")
detector = SafetyDetector(weights_path=weights_path, fallback_model=fallback_model)
video_processor = VideoProcessor(detector=detector)

MAX_IMAGE_SIZE_BYTES = int(os.environ.get("MAX_IMAGE_SIZE_MB", 25)) * 1024 * 1024
MAX_VIDEO_SIZE_BYTES = int(os.environ.get("MAX_VIDEO_SIZE_MB", 50)) * 1024 * 1024


@router.get("/health")
async def health_check():
    """Returns backend status, detector health, and system readiness."""
    return {
        "status": "online",
        "service": "PPE Helmet & Safety Detection API",
        "detector": "custom_ppe" if detector.is_custom_ppe else "yolo_v8",
        "weights_loaded": detector.model is not None,
        "classes_count": len(detector.class_names)
    }


@router.get("/model/info")
async def get_model_info():
    """Returns detailed information on the loaded YOLO model and classes."""
    return detector.get_model_info()


@router.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image file (JPG, JPEG, PNG).
    Runs YOLO inference to detect people, helmets, vests, and safety violations.
    """
    # Validate extension
    filename = file.filename or "upload.jpg"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{ext}'. Please upload JPG, JPEG, or PNG."
        )

    # Read bytes and validate size
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read image stream: {str(e)}"
        )

    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB."
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    try:
        result = detector.detect_image(contents, filename)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YOLO image analysis failed: {str(e)}"
        )


@router.post("/detect/video")
async def detect_video(file: UploadFile = File(...)):
    """
    Processes an uploaded MP4 video with YOLO and OpenCV frame-by-frame.
    Generates an annotated output video and metrics.
    """
    filename = file.filename or "video.mp4"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".mp4", ".webm", ".avi", ".mov", ".m4v"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported video format '{ext}'. Please upload an MP4 video."
        )

    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read video stream: {str(e)}"
        )

    if len(contents) > MAX_VIDEO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Video exceeds maximum allowed size of {MAX_VIDEO_SIZE_BYTES // (1024 * 1024)}MB."
        )

    try:
        result = video_processor.process_video(contents, filename)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YOLO video processing failed: {str(e)}"
        )
