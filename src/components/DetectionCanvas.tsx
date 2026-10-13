import React, { useState } from 'react';
import {
  Download,
  Eye,
  Columns,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ImageAnalysisResponse, DetectionItem } from '../types/detection';

interface DetectionCanvasProps {
  originalUrl: string;
  result: ImageAnalysisResponse;
}

export const DetectionCanvas: React.FC<DetectionCanvasProps> = ({
  originalUrl,
  result,
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'annotated' | 'original'>('side-by-side');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'violations' | 'compliant'>('all');

  const filteredDetections = result.detections.filter((d) => {
    if (selectedFilter === 'violations') return d.is_violation;
    if (selectedFilter === 'compliant') return !d.is_violation;
    return true;
  });

  const handleDownload = () => {
    const downloadUrl = result.annotated_image_url || result.annotated_image_base64 || originalUrl;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `ppe_detection_${result.image_id || Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeStyle = (item: DetectionItem) => {
    if (item.is_violation) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
    if (item.class_name.includes('helmet') || item.class_name.includes('vest')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Metrics & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Inference Time:</span>
            <span className="font-mono font-bold text-white">
              {result.processing_time_ms.toFixed(1)} ms
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Total Detections:</span>
            <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {result.detections.length}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {result.counts.compliant_workers} Compliant
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {result.counts.violation_workers} Violations
            </span>
          </div>
        </div>

        {/* View Switcher & Download */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'side-by-side' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>
            <button
              onClick={() => setViewMode('annotated')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'annotated' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Annotated</span>
            </button>
            <button
              onClick={() => setViewMode('original')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'original' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Original</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Image Preview Canvas */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-hidden">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-medium text-slate-300">Original Inspection Photo</span>
                <span className="text-[11px] text-slate-400">Raw Input</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center min-h-[300px]">
                <img
                  src={originalUrl}
                  alt="Original"
                  className="max-h-[500px] w-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-medium text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Annotated YOLO Detections
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  {result.model_mode.toUpperCase()}
                </span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center min-h-[300px]">
                <img
                  src={result.annotated_image_url || result.annotated_image_base64 || originalUrl}
                  alt="Annotated Detection"
                  className="max-h-[500px] w-full object-contain"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-medium text-slate-200">
                {viewMode === 'annotated' ? 'YOLO Annotated Result' : 'Original Input Photo'}
              </span>
              <span className="text-xs text-slate-400">{result.filename}</span>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center min-h-[360px]">
              <img
                src={
                  viewMode === 'annotated'
                    ? result.annotated_image_url || result.annotated_image_base64 || originalUrl
                    : originalUrl
                }
                alt="Selected view"
                className="max-h-[600px] w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Detections List & Bounding Box Inspection */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">
              Detected Objects &amp; Confidence Breakdown
            </h3>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-1">Filter:</span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({result.detections.length})
            </button>
            <button
              onClick={() => setSelectedFilter('violations')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedFilter === 'violations'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Violations ({result.detections.filter((d) => d.is_violation).length})
            </button>
            <button
              onClick={() => setSelectedFilter('compliant')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedFilter === 'compliant'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Compliant ({result.detections.filter((d) => !d.is_violation).length})
            </button>
          </div>
        </div>

        {filteredDetections.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No detections match the selected filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDetections.map((det) => (
              <div
                key={det.id}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${getBadgeStyle(
                        det
                      )}`}
                    >
                      {det.label || det.class_name}
                    </span>
                    {det.is_violation && (
                      <span className="text-[10px] text-rose-400 font-bold uppercase">
                        Violation
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Box: [{det.bbox.map((n) => Math.round(n)).join(', ')}]
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-white">
                    {(det.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Confidence</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Worker Compliance Table */}
        {result.workers && result.workers.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Worker-Level Association &amp; Compliance Audit
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2 font-medium">Worker ID</th>
                    <th className="pb-2 font-medium">Helmet Status</th>
                    <th className="pb-2 font-medium">Vest Status</th>
                    <th className="pb-2 font-medium">Audit Outcome</th>
                    <th className="pb-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.workers.map((worker) => (
                    <tr key={worker.worker_id} className="text-slate-300">
                      <td className="py-2.5 font-mono font-medium text-white">
                        {worker.worker_id}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            worker.has_helmet
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {worker.has_helmet ? '✓ Helmet Detected' : '✗ Missing Helmet'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            worker.has_vest
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {worker.has_vest ? '✓ Vest Detected' : '✗ Missing Vest'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            worker.is_compliant
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {worker.is_compliant ? 'Compliant' : 'Violation'}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400">
                        {worker.violations.length > 0
                          ? worker.violations.join(', ')
                          : 'All safety equipment confirmed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
