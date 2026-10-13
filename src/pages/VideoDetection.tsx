import React, { useState, useRef } from 'react';
import {
  Video as VideoIcon,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Play,
  Download,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { analyzeVideo, ApiError } from '../services/api';
import { VideoAnalysisResponse, AnalysisRecord } from '../types/detection';

interface VideoDetectionProps {
  onAddHistory: (record: AnalysisRecord) => void;
  activeInspectRecord?: AnalysisRecord | null;
}

export const VideoDetection: React.FC<VideoDetectionProps> = ({
  onAddHistory,
  activeInspectRecord,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(
    activeInspectRecord ? activeInspectRecord.previewUrl : null
  );
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [result, setResult] = useState<VideoAnalysisResponse | null>(
    activeInspectRecord?.details && 'total_frames' in activeInspectRecord.details
      ? (activeInspectRecord.details as VideoAnalysisResponse)
      : null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate a demo animated canvas video clip (WebM/MP4) for instant testing
  const createDemoVideo = async (): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d')!;

      const stream = canvas.captureStream(20); // 20 fps
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8',
        });
      } catch {
        mediaRecorder = new MediaRecorder(stream);
      }

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const file = new File([blob], 'safety_patrol_clip.mp4', {
          type: 'video/mp4',
        });
        resolve(file);
      };

      mediaRecorder.start();

      let frame = 0;
      const totalFrames = 60; // 3 seconds at 20fps

      const drawFrame = () => {
        if (frame >= totalFrames) {
          mediaRecorder.stop();
          return;
        }

        // Draw background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 640, 360);

        // Ground line
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 280);
        ctx.lineTo(640, 280);
        ctx.stroke();

        // Moving Worker 1 (Compliant: Yellow helmet + Vest)
        const x1 = 80 + frame * 4;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(x1 + 10, 180, 15, 90);
        ctx.fillRect(x1 + 30, 180, 15, 90);
        ctx.fillStyle = '#f59e0b'; // vest
        ctx.fillRect(x1, 100, 55, 80);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x1, 120, 55, 10);
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.arc(x1 + 27, 75, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#eab308'; // helmet
        ctx.beginPath();
        ctx.arc(x1 + 27, 68, 20, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x1 + 5, 68, 44, 5);

        // Stationary Worker 2 (Violation: No Helmet)
        const x2 = 460;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(x2 + 10, 180, 15, 90);
        ctx.fillRect(x2 + 30, 180, 15, 90);
        ctx.fillStyle = '#475569'; // jacket without vest
        ctx.fillRect(x2, 100, 55, 80);
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.arc(x2 + 27, 75, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1c1917'; // black hair (no helmet)
        ctx.beginPath();
        ctx.arc(x2 + 27, 72, 18, Math.PI, Math.PI * 2);
        ctx.fill();

        // Frame number stamp
        ctx.fillStyle = '#38bdf8';
        ctx.font = '12px monospace';
        ctx.fillText(`CCTV CAM-04 | FRAME ${frame + 1}/60`, 20, 30);

        frame++;
        requestAnimationFrame(drawFrame);
      };

      drawFrame();
    });
  };

  const handleSelectDemoClip = async () => {
    setErrorMsg(null);
    setProcessing(true);
    setProgressPercent(15);
    try {
      const file = await createDemoVideo();
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      setResult(null);
    } catch {
      setErrorMsg('Failed to generate demo clip in browser.');
    } finally {
      setProcessing(false);
      setProgressPercent(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.includes('video') && !file.name.match(/\.(mp4|webm|avi|mov)$/i)) {
        setErrorMsg('Please select a valid MP4 or web video file.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg('Video file size exceeds 50MB limit.');
        return;
      }
      setErrorMsg(null);
      setSelectedFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleProcessVideo = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    setErrorMsg(null);
    setProgressPercent(10);

    // Simulate animated progress while backend processes frames
    const interval = setInterval(() => {
      setProgressPercent((prev) => (prev < 90 ? prev + 12 : prev));
    }, 400);

    try {
      const res = await analyzeVideo(selectedFile);
      clearInterval(interval);
      setProgressPercent(100);
      setResult(res);

      const totalV =
        res.summary.total_helmet_violations + res.summary.total_vest_violations;
      const record: AnalysisRecord = {
        id: res.video_id || `vid_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'video',
        filename: selectedFile.name,
        previewUrl: videoPreviewUrl || '',
        annotatedUrl: res.video_url,
        total_persons: res.summary.total_persons_detected,
        helmet_violations: res.summary.total_helmet_violations,
        vest_violations: res.summary.total_vest_violations,
        compliance_percentage: res.summary.average_compliance_percentage,
        processing_time: `${res.processing_time_s.toFixed(2)}s (${res.fps.toFixed(1)} fps)`,
        model_mode: 'YOLO Video Stream',
        status:
          totalV === 0
            ? 'compliant'
            : res.summary.average_compliance_percentage < 50
            ? 'critical'
            : 'warning',
        details: res,
      };

      onAddHistory(record);
    } catch (err: unknown) {
      clearInterval(interval);
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to process video with YOLO backend.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Video Detection &amp; PPE Stream Processing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload MP4 surveillance or site footage. OpenCV and YOLO extract frames, detect safety violations, and output an annotated video.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-6 text-center cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/x-m4v,video/*,.mp4"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-cyan-600/10 text-cyan-400 flex items-center justify-center mb-3 border border-cyan-500/20">
              <VideoIcon className="w-6 h-6" />
            </div>
            {selectedFile ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-white">
                  Drag &amp; drop MP4 video clip, or click to browse
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports MP4 surveillance feeds, maximum 50MB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleProcessVideo}
              disabled={!selectedFile || processing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Video Frames...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Process Video</span>
                </>
              )}
            </button>

            {selectedFile && !processing && (
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setVideoPreviewUrl(null);
                  setResult(null);
                }}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={handleSelectDemoClip}
            disabled={processing}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Safety Patrol Clip</span>
          </button>
        </div>

        {/* Progress Bar */}
        {processing && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Running YOLO on video frames...</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-rose-300 block">Video Analysis Error</span>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Video Results Player & Statistics */}
      {result && (
        <div className="space-y-6">
          {/* Top Summary Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">Frames Processed</span>
              <span className="text-xl font-bold text-white font-mono">
                {result.processed_frames} / {result.total_frames}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">Processing Speed</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">
                {result.fps.toFixed(1)} FPS ({result.processing_time_s.toFixed(2)}s)
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">Helmet Violations</span>
              <span className="text-xl font-bold text-rose-400 font-mono">
                {result.summary.total_helmet_violations}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">Average Compliance</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {result.summary.average_compliance_percentage}%
              </span>
            </div>
          </div>

          {/* Video Player */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Annotated Video Stream Preview
                </h3>
              </div>
              <a
                href={result.video_url}
                download={`annotated_${result.filename}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Processed Video</span>
              </a>
            </div>

            <div className="rounded-lg overflow-hidden bg-black border border-slate-800 aspect-video max-h-[460px] flex items-center justify-center">
              <video
                src={result.video_url}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
