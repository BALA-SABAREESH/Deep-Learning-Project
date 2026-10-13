import React from 'react';
import {
  Users,
  HardHat,
  ShieldAlert,
  Percent,
  ScanEye,
  Video,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ComplianceChart } from '../components/ComplianceChart';
import { AnalysisRecord } from '../types/detection';
import { NavTab } from '../components/Sidebar';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
  history: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  history,
  onSelectRecord,
}) => {
  // Aggregate stats across session
  const totalAnalyzed = history.length;
  const imageCount = history.filter((r) => r.type === 'image').length;
  const videoCount = history.filter((r) => r.type === 'video').length;

  const totalPeople = history.reduce((sum, r) => sum + r.total_persons, 0);
  const helmetViolations = history.reduce((sum, r) => sum + r.helmet_violations, 0);
  const vestViolations = history.reduce((sum, r) => sum + r.vest_violations, 0);
  const totalViolations = helmetViolations + vestViolations;

  const averageCompliance =
    totalAnalyzed > 0
      ? Math.round(
          history.reduce((sum, r) => sum + r.compliance_percentage, 0) / totalAnalyzed
        )
      : 100;

  // Breakdown for charts
  const compliantWorkers = Math.max(0, totalPeople - totalViolations);
  const chartBreakdown = {
    helmets: Math.max(0, totalPeople - helmetViolations),
    missingHelmets: helmetViolations,
    vests: Math.max(0, totalPeople - vestViolations),
    missingVests: vestViolations,
    persons: totalPeople,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-900/40 p-6 md:p-8">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated Safety Compliance Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Industrial PPE &amp; Helmet Detection
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Real-time deep learning computer vision pipeline powered by Ultralytics YOLO.
            Monitors construction and industrial sites to detect safety helmets, high-visibility vests, and PPE violations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('image')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/20"
            >
              <ScanEye className="w-4 h-4" />
              <span>Inspect Image</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
            <button
              onClick={() => onNavigate('video')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Video className="w-4 h-4 text-cyan-400" />
              <span>Analyze Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Scans"
          value={totalAnalyzed}
          subtext={`${imageCount} images, ${videoCount} videos`}
          icon={ScanEye}
          variant="blue"
          badge="Session"
        />
        <StatCard
          title="People Detected"
          value={totalPeople}
          subtext="Personnel in monitored zones"
          icon={Users}
          variant="slate"
        />
        <StatCard
          title="Helmet Violations"
          value={helmetViolations}
          subtext="Workers missing hardhats"
          icon={HardHat}
          variant={helmetViolations > 0 ? 'rose' : 'emerald'}
          badge={helmetViolations > 0 ? 'Action Req.' : 'Clear'}
        />
        <StatCard
          title="Vest Violations"
          value={vestViolations}
          subtext="Workers missing safety vest"
          icon={ShieldAlert}
          variant={vestViolations > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Compliance Rate"
          value={`${averageCompliance}%`}
          subtext="Overall safety compliance"
          icon={Percent}
          variant={averageCompliance >= 85 ? 'emerald' : 'rose'}
          badge={averageCompliance >= 85 ? 'High' : 'At Risk'}
        />
      </div>

      {/* Visual Analytics Charts */}
      <ComplianceChart
        compliantCount={compliantWorkers}
        violationCount={totalViolations}
        detectionBreakdown={chartBreakdown}
      />

      {/* Recent Session History Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Analyses (Session Volatile)</h2>
            <p className="text-xs text-slate-400">
              Temporary state in browser memory — zero database retention
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>View All ({history.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 rounded-lg border border-dashed border-slate-800 bg-slate-950/40">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">No inspections analyzed yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload an image or video to test the deep learning YOLO safety detector.
            </p>
            <button
              onClick={() => onNavigate('image')}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Start First Inspection
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">Preview</th>
                  <th className="pb-3 font-medium">Type / Filename</th>
                  <th className="pb-3 font-medium">People</th>
                  <th className="pb-3 font-medium">Violations</th>
                  <th className="pb-3 font-medium">Compliance</th>
                  <th className="pb-3 font-medium">Processing Time</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.slice(0, 5).map((record) => (
                  <tr key={record.id} className="text-slate-300 hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pr-3">
                      <img
                        src={record.annotatedUrl || record.previewUrl}
                        alt="thumb"
                        className="w-10 h-10 rounded object-cover border border-slate-700 bg-slate-950"
                      />
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-white truncate max-w-[180px]">
                        {record.filename}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{record.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono font-medium">{record.total_persons}</td>
                    <td className="py-3">
                      {record.helmet_violations + record.vest_violations > 0 ? (
                        <span className="flex items-center gap-1 text-rose-400 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{record.helmet_violations + record.vest_violations} Violations</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">0 Clean</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          record.compliance_percentage >= 80
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {record.compliance_percentage}%
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-400">{record.processing_time}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectRecord(record)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
