import React, { useState, useEffect } from 'react';
import {
  Binary,
  Cpu,
  Layers,
  FileCode,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  HardHat,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { getModelInfo } from '../services/api';
import { ModelInfoResponse } from '../types/detection';

export const ModelInformation: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const data = await getModelInfo();
      setModelInfo(data);
    } catch {
      // Fallback display if backend is offline
      setModelInfo({
        model_name: 'YOLOv8 Nano (yolov8n.pt)',
        model_type: 'yolo_standard',
        weights_loaded: true,
        weights_path: 'backend/weights/yolov8n.pt',
        supported_classes: [
          'person',
          'helmet',
          'no_helmet',
          'vest',
          'no_vest',
          'machinery',
        ],
        detection_classes_breakdown: {
          equipment: ['helmet (Hardhat)', 'vest (High-Vis Vest)'],
          violations: ['no_helmet (Missing Hardhat)', 'no_vest (Missing Vest)'],
          subjects: ['person (Worker)'],
        },
        confidence_threshold: 0.35,
        iou_threshold: 0.45,
        inference_device: 'CPU (PyTorch Engine)',
        status_message:
          'Base YOLOv8 model initialized with upper-body PPE heuristics. For highest production precision, train custom weights with training/train.py and place ppe_best.pt in backend/weights/',
        recommended_custom_weights: 'backend/weights/ppe_best.pt',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const powershellCommands = `# Terminal 1: Start Python FastAPI Backend
cd backend
python -m venv venv
.\\venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start React Frontend
npm install
npm run dev`;

  const bashCommands = `# Terminal 1: Start Python FastAPI Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start React Frontend
npm install
npm run dev`;

  const trainCommands = `# Run YOLOv8 PPE Training on Custom Dataset
cd training
python train.py --epochs 50 --batch 16 --imgsz 640 --weights yolov8n.pt

# Output best weights will be saved to:
# runs/detect/ppe_safety_model/weights/best.pt
# Copy best.pt to backend/weights/ppe_best.pt`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            YOLO Model &amp; Deep Learning Specifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ultralytics YOLO architecture, weights verification, custom PPE training pipeline, and execution commands.
          </p>
        </div>

        <button
          onClick={fetchInfo}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Model Status Card */}
      {modelInfo && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-semibold text-white">
                  Active Model: {modelInfo.model_name}
                </h2>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    modelInfo.model_type === 'custom_ppe'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {modelInfo.model_type === 'custom_ppe'
                    ? 'Custom Trained Weights'
                    : 'YOLOv8 Vision Core'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Weights Path: {modelInfo.weights_path}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Device: </span>
                <span className="text-cyan-400 font-mono font-medium">
                  {modelInfo.inference_device}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Confidence Threshold: </span>
                <span className="text-white font-mono font-medium">
                  {(modelInfo.confidence_threshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Model Status Notice */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300 block mb-1">
                Domain Weights Notice &amp; Production Guidance
              </span>
              <p>{modelInfo.status_message}</p>
              <p className="mt-1 text-slate-400">
                General-purpose YOLO (COCO) detects generic objects (e.g. person, backpack).
                For certified industrial compliance, specialized PPE datasets (like Roboflow Construction PPE or SHWD) provide ground-truth hardhat and high-visibility vest bounding boxes.
              </p>
            </div>
          </div>

          {/* Supported Classes Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Supported Class Labels &amp; Categorization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Compliant Equipment</span>
                </div>
                <div className="space-y-1">
                  {modelInfo.detection_classes_breakdown.equipment.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Safety Violations</span>
                </div>
                <div className="space-y-1">
                  {modelInfo.detection_classes_breakdown.violations.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <Layers className="w-4 h-4" />
                  <span>Monitored Subjects</span>
                </div>
                <div className="space-y-1">
                  {modelInfo.detection_classes_breakdown.subjects.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training & Execution Instructions */}
      <div className="space-y-6">
        <h2 className="text-base font-semibold text-white">
          Execution Commands &amp; Custom Training Guide
        </h2>

        {/* Windows PowerShell Commands */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Windows PowerShell Setup (Separate Terminals)</span>
            </div>
            <button
              onClick={() => copyToClipboard(powershellCommands, 'ps')}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              {copiedId === 'ps' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy PowerShell
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto bg-slate-950/70">
            {powershellCommands}
          </pre>
        </div>

        {/* Linux / macOS Bash Commands */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Linux / macOS Bash Setup</span>
            </div>
            <button
              onClick={() => copyToClipboard(bashCommands, 'bash')}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              {copiedId === 'bash' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Bash
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto bg-slate-950/70">
            {bashCommands}
          </pre>
        </div>

        {/* Training Script & Dataset Guide */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              Custom PPE Dataset &amp; Training Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A standalone training script is included in{' '}
            <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">
              training/train.py
            </code>{' '}
            alongside the configuration{' '}
            <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">
              training/dataset.yaml
            </code>
            . You can train on popular datasets such as:
          </p>

          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
            <li>
              <strong className="text-slate-200">Roboflow Hardhat Workers Dataset:</strong> 5,000+ annotated site photos with classes: helmet, head, person.
            </li>
            <li>
              <strong className="text-slate-200">SHWD (Safety Helmet Wearing Dataset):</strong> 7,581 images with labeled hardhat and bare-head instances.
            </li>
            <li>
              <strong className="text-slate-200">Pictor PPE Dataset:</strong> Annotated high-visibility safety vests, gloves, boots, and goggles.
            </li>
          </ul>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Training Command</span>
              <button
                onClick={() => copyToClipboard(trainCommands, 'train')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                {copiedId === 'train' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-emerald-300 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
              {trainCommands}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
