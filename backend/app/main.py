import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from .routes.detection import router as detection_router

app = FastAPI(
    title="Helmet and Safety Equipment Detection API",
    description="Real-time deep learning computer vision API using Ultralytics YOLO & OpenCV for PPE compliance.",
    version="1.0.0"
)

# Enable CORS for React development and preview origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include detection routes
app.include_router(detection_router, prefix="/api")

OUTPUT_DIR = os.path.abspath(os.environ.get("OUTPUT_DIR", "backend/outputs"))
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.get("/api/outputs/{filename}")
async def serve_output_file(filename: str):
    """
    Securely serves generated annotated images and videos.
    Protects against directory traversal attacks.
    """
    safe_filename = os.path.basename(filename)
    filepath = os.path.join(OUTPUT_DIR, safe_filename)

    # Verify path is within OUTPUT_DIR
    if not os.path.abspath(filepath).startswith(OUTPUT_DIR):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to file path is forbidden."
        )

    if not os.path.isfile(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File '{safe_filename}' not found."
        )

    ext = os.path.splitext(safe_filename)[1].lower()
    media_type = "video/mp4" if ext in [".mp4", ".webm"] else "image/png"

    return FileResponse(
        filepath,
        media_type=media_type,
        filename=safe_filename
    )


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "PPE Helmet & Safety Detection API",
        "docs_url": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=True)
