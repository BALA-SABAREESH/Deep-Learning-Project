import os
import time
import uuid
import tempfile
from typing import Dict, Any, List
import cv2
import numpy as np
from .yolo_detector import SafetyDetector


class VideoProcessor:
    """
    Processes MP4 videos frame-by-frame with YOLO and OpenCV,
    annotates bounding boxes, and generates downloadable video clips.
    """

    def __init__(self, detector: SafetyDetector):
        self.detector = detector
        self.output_dir = os.environ.get("OUTPUT_DIR", "backend/outputs")
        os.makedirs(self.output_dir, exist_ok=True)
        self.max_frames = int(os.environ.get("MAX_VIDEO_FRAMES", 120))

    def process_video(self, video_bytes: bytes, filename: str = "video.mp4") -> Dict[str, Any]:
        """
        Extracts frames from video, runs YOLO detector, writes annotated video stream,
        and aggregates temporal safety statistics.
        """
        start_time = time.time()

        # Write uploaded bytes to a temporary video file for OpenCV
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_in:
            temp_in.write(video_bytes)
            temp_in_path = temp_in.name

        cap = cv2.VideoCapture(temp_in_path)
        if not cap.isOpened():
            os.remove(temp_in_path)
            raise ValueError("Unable to read video file format. Ensure valid MP4 stream.")

        orig_fps = cap.get(cv2.CAP_PROP_FPS) or 20.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 360
        total_available_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 60

        # Limit max frames for responsive mini-project execution
        frames_to_process = min(total_available_frames, self.max_frames)

        out_filename = f"annotated_{uuid.uuid4().hex[:12]}_{filename}"
        out_filepath = os.path.join(self.output_dir, out_filename)

        # VideoWriter with standard MP4 codec (mp4v or avc1)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(out_filepath, fourcc, orig_fps, (width, height))

        total_persons = 0
        total_helmet_violations = 0
        total_vest_violations = 0
        compliance_scores = []
        frame_idx = 0

        try:
            while frame_idx < frames_to_process:
                ret, frame = cap.read()
                if not ret:
                    break

                # Encode frame to memory buffer for detector
                _, buf = cv2.imencode(".jpg", frame)
                det_res = self.detector.detect_image(buf.tobytes(), f"frame_{frame_idx}.jpg")

                # Re-annotate frame using detector logic
                annotated_frame = self.detector._draw_annotations(
                    frame.copy(), det_res["detections"], det_res["workers"]
                )

                # Add timestamp and watermarking overlay
                cv2.putText(
                    annotated_frame,
                    f"PPE YOLO | FRAME {frame_idx + 1}/{frames_to_process}",
                    (15, 25),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 255),
                    2,
                    cv2.LINE_AA
                )

                out.write(annotated_frame)

                # Accumulate metrics
                counts = det_res["counts"]
                total_persons = max(total_persons, counts["total_persons"])
                total_helmet_violations += counts["missing_helmets"]
                total_vest_violations += counts["missing_vests"]
                compliance_scores.append(det_res["compliance_percentage"])

                frame_idx += 1

        finally:
            cap.release()
            out.release()
            if os.path.exists(temp_in_path):
                os.remove(temp_in_path)

        processing_time_s = time.time() - start_time
        effective_fps = frame_idx / processing_time_s if processing_time_s > 0 else 0

        avg_compliance = (
            round(sum(compliance_scores) / len(compliance_scores), 1)
            if compliance_scores
            else 100.0
        )

        return {
            "success": True,
            "video_id": uuid.uuid4().hex[:12],
            "filename": filename,
            "video_url": f"/api/outputs/{out_filename}",
            "total_frames": total_available_frames,
            "processed_frames": frame_idx,
            "fps": round(effective_fps, 1),
            "processing_time_s": round(processing_time_s, 2),
            "model_name": "YOLOv8 Video Pipeline",
            "summary": {
                "total_persons_detected": total_persons,
                "total_helmet_violations": total_helmet_violations,
                "total_vest_violations": total_vest_violations,
                "average_compliance_percentage": avg_compliance,
                "peak_concurrent_workers": total_persons
            }
        }
