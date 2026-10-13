import React, { useState } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { DetectionCanvas } from '../components/DetectionCanvas';
import { analyzeImage, ApiError } from '../services/api';
import { ImageAnalysisResponse, AnalysisRecord } from '../types/detection';
import { AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';

interface ImageDetectionProps {
  onAddHistory: (record: AnalysisRecord) => void;
  activeInspectRecord?: AnalysisRecord | null;
  onClearInspectRecord?: () => void;
}

export const ImageDetection: React.FC<ImageDetectionProps> = ({
  onAddHistory,
  activeInspectRecord,
  onClearInspectRecord,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    activeInspectRecord ? activeInspectRecord.previewUrl : null
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResponse | null>(
    activeInspectRecord?.details && 'counts' in activeInspectRecord.details
      ? (activeInspectRecord.details as ImageAnalysisResponse)
      : null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to generate a realistic synthetic test image with construction workers on Canvas
  const createSampleImage = (type: string): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d')!;

      // Background - Industrial Construction Scene
      const grad = ctx.createLinearGradient(0, 0, 0, 600);
      grad.addColorStop(0, '#334155');
      grad.addColorStop(0.6, '#475569');
      grad.addColorStop(1, '#1E293B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      // Scaffolding lines
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(100, 50);
      ctx.lineTo(100, 550);
      ctx.moveTo(700, 50);
      ctx.lineTo(700, 550);
      ctx.moveTo(80, 200);
      ctx.lineTo(720, 200);
      ctx.moveTo(80, 400);
      ctx.lineTo(720, 400);
      ctx.stroke();

      // Ground floor
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 520, 800, 80);

      const drawWorker = (
        x: number,
        y: number,
        hasHelmet: boolean,
        hasVest: boolean,
        name: string
      ) => {
        // Body / Pants
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(x + 15, y + 160, 25, 120); // legs
        ctx.fillRect(x + 50, y + 160, 25, 120);

        // Torso / Vest
        if (hasVest) {
          ctx.fillStyle = '#f59e0b'; // Neon Safety Vest
          ctx.fillRect(x + 10, y + 70, 70, 95);
          // High vis stripes
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 10, y + 95, 70, 12);
          ctx.fillRect(x + 10, y + 130, 70, 12);
        } else {
          ctx.fillStyle = '#475569'; // Plain jacket / No vest
          ctx.fillRect(x + 10, y + 70, 70, 95);
        }

        // Head
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.arc(x + 45, y + 42, 24, 0, Math.PI * 2);
        ctx.fill();

        // Helmet or hair
        if (hasHelmet) {
          ctx.fillStyle = '#eab308'; // Hardhat Yellow
          ctx.beginPath();
          ctx.ellipse(x + 45, y + 30, 28, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          // Hardhat brim
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(x + 14, y + 36, 62, 7);
        } else {
          // Dark hair / No Helmet
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.arc(x + 45, y + 32, 22, Math.PI, Math.PI * 2);
          ctx.fill();
        }

        // Label tag
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(name, x + 10, y + 295);
      };

      if (type === 'construction_workers') {
        drawWorker(160, 220, true, true, 'Worker A');
        drawWorker(380, 220, true, true, 'Worker B');
        drawWorker(580, 220, false, true, 'Worker C');
      } else if (type === 'helmet_violation') {
        drawWorker(350, 210, false, false, 'Violation Case');
      } else {
        // full_compliance
        drawWorker(250, 210, true, true, 'Compliant A');
        drawWorker(470, 210, true, true, 'Compliant B');
      }

      canvas.toBlob((blob) => {
        const file = new File([blob!], `${type}_test_sample.png`, {
          type: 'image/png',
        });
        resolve(file);
      }, 'image/png');
    });
  };

  const handleSelectSample = async (sampleId: string) => {
    setErrorMsg(null);
    if (onClearInspectRecord) onClearInspectRecord();
    const file = await createSampleImage(sampleId);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAnalysisResult(null);
  };

  const handleFileSelected = (file: File) => {
    setErrorMsg(null);
    if (onClearInspectRecord) onClearInspectRecord();
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAnalysisResult(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    if (onClearInspectRecord) onClearInspectRecord();
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !previewUrl) return;
    setAnalyzing(true);
    setErrorMsg(null);

    try {
      let fileToUpload = selectedFile;
      if (!fileToUpload && previewUrl) {
        // convert preview to file if needed
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        fileToUpload = new File([blob], 'inspection_sample.png', { type: 'image/png' });
      }

      if (!fileToUpload) throw new Error('No valid file available to analyze');

      const response = await analyzeImage(fileToUpload);
      setAnalysisResult(response);

      // Add to session history
      const totalViolations =
        response.counts.missing_helmets + response.counts.missing_vests;
      const record: AnalysisRecord = {
        id: response.image_id || `img_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'image',
        filename: fileToUpload.name,
        previewUrl: previewUrl || '',
        annotatedUrl: response.annotated_image_url || response.annotated_image_base64,
        total_persons: response.counts.total_persons,
        helmet_violations: response.counts.missing_helmets,
        vest_violations: response.counts.missing_vests,
        compliance_percentage: response.compliance_percentage,
        processing_time: `${response.processing_time_ms.toFixed(1)} ms`,
        model_mode: response.model_mode,
        status:
          totalViolations === 0
            ? 'compliant'
            : response.compliance_percentage < 50
            ? 'critical'
            : 'warning',
        details: response,
      };

      onAddHistory(record);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('An unexpected error occurred during YOLO image analysis.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Image Detection &amp; Safety Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload construction or factory images to detect workers, safety helmets, and protective vests using YOLO deep learning.
        </p>
      </div>

      {/* Upload & Controls Section */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <ImageUploader
          onFileSelected={handleFileSelected}
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          analyzing={analyzing}
          onAnalyze={handleAnalyze}
          onReset={handleReset}
          onSelectSample={handleSelectSample}
        />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-rose-300 block">Analysis Error</span>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Analysis Result Canvas */}
      {analysisResult && previewUrl && (
        <DetectionCanvas originalUrl={previewUrl} result={analysisResult} />
      )}
    </div>
  );
};
