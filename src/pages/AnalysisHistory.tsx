import React, { useState } from 'react';
import {
  History,
  Trash2,
  ScanEye,
  Video,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { AnalysisRecord } from '../types/detection';

interface AnalysisHistoryProps {
  history: AnalysisRecord[];
  onClearHistory: () => void;
  onInspectRecord: (record: AnalysisRecord) => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  history,
  onClearHistory,
  onInspectRecord,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = history.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery.trim() && !item.filename.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Inspection History &amp; Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Session history stored temporarily in React state. No database or disk persistence.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 mr-1">Filter Media:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Scans ({history.length})
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'image'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ScanEye className="w-3.5 h-3.5" />
            <span>Images ({history.filter((h) => h.type === 'image').length})</span>
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'video'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos ({history.filter((h) => h.type === 'video').length})</span>
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* History Items Grid / Table */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No history records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {history.length === 0
              ? 'Run inspections in the Image Detection or Video Detection tabs to build your audit log.'
              : 'No records matched your search query or filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((record) => {
            const totalV = record.helmet_violations + record.vest_violations;
            return (
              <div
                key={record.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1 font-semibold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {record.type === 'image' ? (
                        <>
                          <ScanEye className="w-3 h-3 text-blue-400" /> Image
                        </>
                      ) : (
                        <>
                          <Video className="w-3 h-3 text-cyan-400" /> Video
                        </>
                      )}
                    </span>
                    <span className="font-mono text-[11px]">{record.timestamp}</span>
                  </div>

                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 mb-3 flex items-center justify-center">
                    {record.type === 'video' ? (
                      <video
                        src={record.annotatedUrl || record.previewUrl}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={record.annotatedUrl || record.previewUrl}
                        alt="Inspection record"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-white truncate" title={record.filename}>
                    {record.filename}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Workers</span>
                      <span className="font-bold text-white">{record.total_persons}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Violations</span>
                      <span
                        className={`font-bold ${
                          totalV > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {totalV}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        totalV === 0 ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-bold text-white font-mono">
                      {record.compliance_percentage}%
                    </span>
                    <span className="text-[10px] text-slate-400">compliance</span>
                  </div>

                  <button
                    onClick={() => onInspectRecord(record)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
