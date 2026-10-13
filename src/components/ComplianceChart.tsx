import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface ComplianceChartProps {
  compliantCount: number;
  violationCount: number;
  detectionBreakdown?: {
    helmets: number;
    missingHelmets: number;
    vests: number;
    missingVests: number;
    persons: number;
  };
}

export const ComplianceChart: React.FC<ComplianceChartProps> = ({
  compliantCount,
  violationCount,
  detectionBreakdown = {
    helmets: 0,
    missingHelmets: 0,
    vests: 0,
    missingVests: 0,
    persons: 0,
  },
}) => {
  const pieData = [
    { name: 'Compliant Workers', value: compliantCount, color: '#10B981' },
    { name: 'Violations Detected', value: violationCount, color: '#EF4444' },
  ];

  const total = compliantCount + violationCount;
  const complianceRate = total > 0 ? Math.round((compliantCount / total) * 100) : 100;

  const barData = [
    { category: 'People', count: detectionBreakdown.persons, fill: '#3B82F6' },
    { category: 'Helmets', count: detectionBreakdown.helmets, fill: '#10B981' },
    { category: 'No Helmet', count: detectionBreakdown.missingHelmets, fill: '#EF4444' },
    { category: 'Vests', count: detectionBreakdown.vests, fill: '#06B6D4' },
    { category: 'No Vest', count: detectionBreakdown.missingVests, fill: '#F59E0B' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Compliance Ratio Donut */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Worker Compliance Status</h3>
            <p className="text-xs text-slate-400">Ratio of safe vs non-compliant personnel</p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {complianceRate}% SAFE
          </span>
        </div>

        <div className="h-56 relative flex items-center justify-center">
          {total === 0 ? (
            <div className="text-center text-slate-500 text-xs">
              No workers scanned in this session yet.
              <br />
              Analyze an image or video to populate chart.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white">{complianceRate}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Compliance</span>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-center gap-6 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Compliant: {compliantCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300">Violations: {violationCount}</span>
          </div>
        </div>
      </div>

      {/* Detections Category Bar Chart */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Detection Counts by Class</h3>
            <p className="text-xs text-slate-400">Instances identified across all recent frames</p>
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="category" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Real-time YOLO classification breakdown</span>
          <span className="text-[11px] text-blue-400 font-mono">
            {detectionBreakdown.helmets + detectionBreakdown.vests} PPE items verified
          </span>
        </div>
      </div>
    </div>
  );
};
