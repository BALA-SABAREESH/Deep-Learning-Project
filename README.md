# Helmet and Safety Equipment Detection Using Deep Learning

A production-grade industrial safety compliance monitoring system powered by **Ultralytics YOLO**, **OpenCV**, **FastAPI**, and **React + Vite**. It detects site workers, safety helmets (hard hats), high-visibility vests, and flags safety violations in real time on photos and video feeds.

---

## 🚀 Key Features

* **Real-Time Detection:** Powered by Ultralytics YOLO with bounding box visualization, class labeling, and confidence scores.
* **PPE Compliance Classification:**
  * 🟢 **Compliant:** Worker wearing safety helmet and high-visibility vest.
  * 🔴 **Safety Violation:** Missing helmet or missing safety vest.
  * 🔵 **Personnel Tracking:** Worker detection and spatial gear association.
* **Side-by-Side Image Comparison:** Inspect original raw photos alongside annotated YOLO detections with split and single view modes.
* **Video Stream Processing:** Upload MP4 videos to extract frames, run detection, and render annotated video output.
* **Session Audit Log:** Temporary in-memory analysis history stored in React state (zero database dependency).
* **Industrial Safety Dashboard:** Key metrics (total scans, personnel count, violation rate, compliance %) and Recharts visualizations.
* **Custom Training Pipeline:** Standalone training script and dataset configuration for fine-tuning YOLO on custom PPE datasets.

---

## 📁 Project Architecture

```
helmet-safety-detection/
├── frontend/                     # React + Vite TypeScript Dashboard
│   ├── src/
│   │   ├── components/           # UI, Charts, Navbar, Sidebar, Uploader
│   │   ├── pages/                # Dashboard, Image, Video, History, Model
│   │   ├── services/api.ts       # Typed API client for FastAPI
│   │   ├── types/detection.ts    # Detection & Worker Compliance Types
│   │   └── App.tsx               # Main application controller
│   └── package.json
├── backend/                      # Python FastAPI YOLO Engine
│   ├── app/
│   │   ├── main.py               # FastAPI entry point & secure file server
│   │   ├── routes/detection.py   # Image & video inference endpoints
│   │   └── services/
│   │       ├── yolo_detector.py  # YOLOv8 inference & spatial PPE heuristics
│   │       └── video_processor.py# Frame-by-frame video pipeline
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Environment variables template
│   └── outputs/                  # Annotated media outputs
├── training/                     # Deep Learning Training Module
│   ├── train.py                  # Ultralytics YOLO training script
│   └── dataset.yaml              # PPE dataset class annotations
└── README.md
```

---

## 💻 Quick Start & Execution

### Option A: Windows (PowerShell)

#### Terminal 1 — FastAPI Backend:
```powershell
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install required packages
pip install -r requirements.txt

# Start FastAPI Uvicorn server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 2 — React Frontend:
```powershell
# In the project root or frontend directory:
npm install
npm run dev
```

Visit the application at: `http://localhost:3000`

---

### Option B: Linux / macOS (Bash)

#### Terminal 1 — Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 2 — Frontend:
```bash
npm install
npm run dev
```

---

## 🧠 YOLO Model Weights Configuration

The system uses a smart dual-mode detector:

1. **Custom PPE Weights (Recommended for Production):**
   * If you have custom trained weights (e.g. `ppe_best.pt`), place the file in `backend/weights/ppe_best.pt`.
   * The backend will automatically detect and load these weights upon start.
   * Supported classes: `['helmet', 'no_helmet', 'vest', 'no_vest', 'person']`.

2. **Standard YOLOv8 Base Mode:**
   * If custom weights are not provided, the backend falls back to `yolov8n.pt`.
   * Standard YOLO detects people (`person`). The upper-body region (head and torso) is analyzed using spatial chromatic profiles to identify hardhats and high-visibility vests.
   * Clear notices are displayed on the **Model Information** page and API responses.

---

## 🏋️ Training Your Own PPE Model

A standalone script is provided in `training/train.py`:

```bash
cd training

# Train YOLOv8n on dataset.yaml for 50 epochs
python train.py --data dataset.yaml --weights yolov8n.pt --epochs 50 --batch 16 --imgsz 640

# Trained weights will automatically be copied to backend/weights/ppe_best.pt
```

### Recommended Public Datasets:
1. **Roboflow Construction Site Safety:** [Roboflow Universe PPE](https://universe.roboflow.com/search?q=hardhat)
2. **SHWD (Safety Helmet Wearing Dataset):** 7,581 construction site images with annotated hardhats and heads.
3. **Pictor PPE:** Comprehensive annotations for safety vests, helmets, and boots.

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and engine readiness |
| `/api/model/info` | `GET` | Loaded model specifications, classes, and thresholds |
| `/api/detect/image` | `POST` | Upload image (JPG/PNG), returns bounding boxes, detections, and compliance |
| `/api/detect/video` | `POST` | Upload MP4 video, returns annotated video stream and summary |
| `/api/outputs/{filename}` | `GET` | Securely serves generated annotated images/videos |

---

## 🛡️ Security & Zero-Database Architecture

* **No Database:** All metrics and scan history are volatile and stored only in client memory during the active session.
* **Directory Traversal Protection:** Output endpoints sanitize filenames using `os.path.basename` and enforce root directory validation.
* **File Validation:** Enforces strict MIME types and file limits (25MB for images, 50MB for video).
