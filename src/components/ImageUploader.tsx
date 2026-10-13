import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, FileCheck, AlertCircle, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  analyzing: boolean;
  onAnalyze: () => void;
  onReset: () => void;
  onSelectSample: (sampleId: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelected,
  selectedFile,
  previewUrl,
  analyzing,
  onAnalyze,
  onReset,
  onSelectSample,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setFileError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setFileError('Invalid file format. Please upload JPG, JPEG, or PNG.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setFileError('File exceeds 25MB limit. Please upload a smaller image.');
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const samplePresets = [
    {
      id: 'construction_workers',
      title: 'Construction Crew',
      desc: 'Multiple workers with helmets & vests',
      tag: 'Mixed Scene',
    },
    {
      id: 'helmet_violation',
      title: 'Missing Helmet Violation',
      desc: 'Worker on site without headgear',
      tag: 'Violation',
    },
    {
      id: 'full_compliance',
      title: 'Full PPE Compliance',
      desc: 'High-vis vest and hardhat verified',
      tag: 'Compliant',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-950/40 scale-[0.99]'
            : selectedFile
            ? 'border-slate-700 bg-slate-900/80 hover:border-slate-600'
            : 'border-slate-700/80 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              validateAndSelect(e.target.files[0]);
            }
          }}
        />

        {previewUrl ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
            <img
              src={previewUrl}
              alt="Upload preview"
              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border border-slate-700 shadow-md shrink-0"
            />
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-white truncate">
                  {selectedFile?.name || 'Selected Image'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Size: {selectedFile ? (selectedFile.size / 1024).toFixed(1) + ' KB' : 'Preset'}
              </p>
              <p className="text-[11px] text-blue-400">
                Click or drop another file to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center mb-3 border border-blue-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">
              Drag &amp; drop inspection photo here, or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports JPG, JPEG, PNG (high resolution up to 25MB)
            </p>
          </div>
        )}
      </div>

      {fileError && (
        <div className="flex items-center gap-2 p-3 text-xs bg-rose-950/40 border border-rose-800/60 text-rose-300 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{fileError}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onAnalyze}
            disabled={!previewUrl || analyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing YOLO Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Detection</span>
              </>
            )}
          </button>

          {previewUrl && !analyzing && (
            <button
              onClick={onReset}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            Try Samples:
          </span>
          {samplePresets.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample.id)}
              disabled={analyzing}
              title={sample.desc}
              className="text-xs px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-colors disabled:opacity-50"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
