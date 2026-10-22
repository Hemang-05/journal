'use client';

import React from 'react';
import { Plus, Download, Settings, Database, Calendar, BarChart3, TrendingUp, User } from 'lucide-react';
import { Profile } from '@/lib/types';
import { isSupabaseConfigured, isDemoModeActive } from '@/lib/storage';

interface HeaderProps {
  profile: Profile;
  onOpenLogModal: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  activeTab: 'journal' | 'analytics' | 'weekly' | 'monthly';
  setActiveTab: (tab: 'journal' | 'analytics' | 'weekly' | 'monthly') => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenLogModal,
  onOpenExportModal,
  onOpenSettingsModal,
  activeTab,
  setActiveTab,
}) => {
  const isDemo = isDemoModeActive();

  const [formattedDate, setFormattedDate] = React.useState<string>('');

  React.useEffect(() => {
    setFormattedDate(
      new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date())
    );
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-700/80 bg-[#0B101D]/95 backdrop-blur-md shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-emerald-400/25">
              <div className="h-full w-full bg-[#0D1322] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-400 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                  Trading Journal
                </h1>
                {isDemo ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Demo Mode
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Database className="w-3 h-3" /> Live DB
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-semibold tracking-wide">
                Log. Review. Improve.
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Bright vibrant active state) */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700/90 shadow-inner">
            <button
              onClick={() => setActiveTab('journal')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'journal'
                  ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Today & Trades
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 stroke-[2.5]" /> Analytics
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'weekly'
                  ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Weekly Review
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'monthly'
                  ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Monthly Review
            </button>
          </div>

          {/* Right Action Items & Profile Pic Logo beside Settings */}
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-medium text-slate-200 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formattedDate}</span>
            </div>

            {/* Export Button */}
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
              title="Export trades to Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettingsModal}
              className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
              title="Settings & Supabase Config"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* USER PROFILE PIC TYPE LOGO BESIDE SETTINGS */}
            <button
              onClick={onOpenSettingsModal}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 transition-all group cursor-pointer shadow-sm"
              title="Trader Profile & Account Details"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 p-0.5 shadow-md shadow-emerald-400/25">
                  <div className="w-full h-full rounded-full bg-[#0D1322] flex items-center justify-center text-[11px] font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    HM
                  </div>
                </div>
                {/* Active Live Status Dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0B101D] rounded-full animate-pulse shadow-sm" />
              </div>
              <span className="hidden xl:inline text-xs font-bold text-slate-200 group-hover:text-white">
                {profile.name || 'Hemang M.'}
              </span>
            </button>

            {/* Primary CTA: + Log Trade */}
            <button
              onClick={onOpenLogModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-lg shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Trade</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-emerald-950/30 text-emerald-950 font-bold rounded">
                N
              </kbd>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-700/60 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
              activeTab === 'journal' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300'
            }`}
          >
            Today & Trades
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
              activeTab === 'weekly' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
              activeTab === 'monthly' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
    </header>
  );
};
