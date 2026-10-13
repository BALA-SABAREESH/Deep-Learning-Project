import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'rose' | 'amber' | 'slate';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'blue',
  badge,
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-950/30 border-blue-800/40',
      iconBg: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
      valueColor: 'text-white',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    emerald: {
      bg: 'bg-emerald-950/30 border-emerald-800/40',
      iconBg: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
      valueColor: 'text-emerald-300',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    rose: {
      bg: 'bg-rose-950/30 border-rose-800/40',
      iconBg: 'bg-rose-600/20 text-rose-400 border border-rose-500/30',
      valueColor: 'text-rose-300',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    amber: {
      bg: 'bg-amber-950/30 border-amber-800/40',
      iconBg: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
      valueColor: 'text-amber-300',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    slate: {
      bg: 'bg-slate-900 border-slate-800',
      iconBg: 'bg-slate-800 text-slate-300 border border-slate-700',
      valueColor: 'text-white',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`relative rounded-xl border p-5 backdrop-blur-sm transition-all hover:border-slate-700 ${style.bg}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${style.valueColor}`}>
              {value}
            </span>
            {badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${style.badgeColor}`}>
                {badge}
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${style.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
