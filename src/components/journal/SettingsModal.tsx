'use client';

import React, { useState } from 'react';
import { X, Settings, Database, RefreshCw, Trash2, Check, ShieldCheck, Key, AlertCircle } from 'lucide-react';
import { Profile } from '@/lib/types';
import { isSupabaseConfigured, isDemoModeActive, setDemoMode } from '@/lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onSaveProfile: (profile: Profile) => Promise<void>;
  onResetSeedData: () => void;
  onClearAllTrades: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetSeedData,
  onClearAllTrades,
}) => {
  const [name, setName] = useState(profile.name || 'Pro Trader');
  const [initialCapital, setInitialCapital] = useState(profile.initial_capital.toString());
  const [currency, setCurrency] = useState(profile.currency || '₹');
  const [demoActive, setDemoActive] = useState(isDemoModeActive());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSave = async () => {
    await onSaveProfile({
      ...profile,
      name,
      initial_capital: Number(initialCapital) || 500000,
      currency,
    });
    setDemoMode(demoActive);
    setStatusMessage('Settings updated successfully!');
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  const handleToggleDemo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setDemoActive(val);
    setDemoMode(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Journal Settings & Storage</h3>
              <p className="text-xs text-slate-400">Account parameters, Supabase connection, and sample data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Profile Settings */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Trading Capital & Units</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Trader Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="₹">₹ (INR - Rupee)</option>
                <option value="$">$ (USD - Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - Pound)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Starting Account Capital (For Drawdown & Equity Curves)</label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Supabase Integration Status */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Supabase PostgreSQL & Storage Status
            </span>
            {isConfigured ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Credentials Detected
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                Local / Demo Mode
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isConfigured
              ? 'Your environment variables are active. Trades are synchronized with Supabase PostgreSQL and Row Level Security.'
              : 'App is running in zero-setup Local Mode. All trades and calculations persist in browser storage. To connect your Supabase database, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY and run supabase/schema.sql.'}
          </p>

          <label className="flex items-center justify-between pt-1 cursor-pointer">
            <span className="text-xs text-slate-300">Force Local Demo Mode</span>
            <input
              type="checkbox"
              checked={demoActive}
              onChange={handleToggleDemo}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
            />
          </label>
        </div>

        {/* Seed Data Controls */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-400 block">Sample & Seed Data Controls</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onResetSeedData();
                setStatusMessage('Loaded realistic sample trades for NIFTY, BANKNIFTY, RELIANCE, TCS, BTCUSD!');
                setTimeout(() => setStatusMessage(null), 3000);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              Reset to Sample Trades
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all logged trades?')) {
                  onClearAllTrades();
                  setStatusMessage('All trades cleared.');
                  setTimeout(() => setStatusMessage(null), 2500);
                }
              }}
              className="px-3 py-2 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md transition-colors"
          >
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
};
