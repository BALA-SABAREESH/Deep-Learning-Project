import React from 'react';
import {
  LayoutDashboard,
  ScanEye,
  Video,
  History,
  Binary,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'image' | 'video' | 'history' | 'model';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  sessionStats: {
    totalImages: number;
    totalVideos: number;
    violations: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  sessionStats,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Metrics',
    },
    {
      id: 'image' as NavTab,
      label: 'Image Detection',
      icon: ScanEye,
      description: 'Scan Photos & PPE',
    },
    {
      id: 'video' as NavTab,
      label: 'Video Detection',
      icon: Video,
      description: 'Stream & Clip Processing',
    },
    {
      id: 'history' as NavTab,
      label: 'Analysis History',
      icon: History,
      description: 'Current Session Log',
    },
    {
      id: 'model' as NavTab,
      label: 'Model Information',
      icon: Binary,
      description: 'YOLO Weights & Training',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div className="px-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation Menu
          </span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className={`text-[11px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Session Quick Metrics Box */}
      <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Session Snapshot</span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded">
            Volatile
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Scanned</span>
            <span className="text-base font-bold text-white">
              {sessionStats.totalImages + sessionStats.totalVideos}
            </span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Violations</span>
            <span className="text-base font-bold text-rose-400">
              {sessionStats.violations}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Zero permanent DB storage.</span>
        </div>
      </div>
    </aside>
  );
};
