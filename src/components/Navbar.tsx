import React from 'react';
import { HardHat, ShieldCheck, AlertTriangle, Cpu, RefreshCw } from 'lucide-react';

interface NavbarProps {
  backendConnected: boolean;
  checkingHealth: boolean;
  onRefreshHealth: () => void;
  modelMode: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendConnected,
  checkingHealth,
  onRefreshHealth,
  modelMode,
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <HardHat className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-white tracking-tight">PPE Vision</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              YOLO AI
            </span>
          </div>
          <p className="text-xs text-slate-400">Industrial Helmet & Safety Equipment Detection</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Model Mode Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-xs">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Engine:</span>
          <span className="font-medium text-slate-200">
            {modelMode === 'custom_ppe' ? 'Custom PPE YOLO' : 'YOLOv8 Detection Core'}
          </span>
        </div>

        {/* Backend Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-400 hidden sm:inline">Backend:</span>
          <span className={`font-medium ${backendConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {backendConnected ? 'FastAPI Online' : 'Connecting...'}
          </span>
          <button
            onClick={onRefreshHealth}
            disabled={checkingHealth}
            title="Check backend connection"
            aria-label="Refresh backend health"
            className="ml-1 p-1 hover:text-white text-slate-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Quick Safety Rule Tag */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-4">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Hardhat &amp; Vest Required
          </span>
        </div>
      </div>
    </header>
  );
};
