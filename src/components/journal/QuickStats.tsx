'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Target, Zap, ShieldAlert, Award } from 'lucide-react';
import { PerformanceStats, TimeframeFilter } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

interface QuickStatsProps {
  stats: PerformanceStats;
  currency: string;
  timeframe: TimeframeFilter;
  setTimeframe: (tf: TimeframeFilter) => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  stats,
  currency,
  timeframe,
  setTimeframe,
}) => {
  const isProfit = stats.netPnl >= 0;
  const isAvgRPositive = stats.averageR >= 0;

  return (
    <div className="space-y-3">
      {/* Timeframe Selector Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
          <Zap className="w-4 h-4 text-emerald-400" />
          Dashboard Performance
        </span>

        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700/80 shadow-inner">
          {(
            [
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
              { key: 'all', label: 'All Time' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setTimeframe(item.key)}
              className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                timeframe === item.key
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-md shadow-emerald-400/30'
                  : 'text-slate-300 hover:text-white font-medium'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 High-Density Bright Quick Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Trades */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/90 hover:border-slate-600 transition-all shadow-md shadow-black/20">
          <div className="flex items-center justify-between text-slate-300 mb-1.5">
            <span className="text-[11px] font-bold tracking-wide uppercase">Total Trades</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-mono font-bold">
              W:{stats.winningTrades} L:{stats.losingTrades}
            </span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white">
            {stats.totalTrades}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-medium flex items-center gap-1">
            <span>Break-Even: {stats.breakEvenTrades}</span>
          </div>
        </div>

        {/* Net P&L */}
        <div className={`p-4 rounded-xl border transition-all shadow-md ${
          isProfit 
            ? 'bg-emerald-950/25 border-emerald-500/40 shadow-emerald-950/20' 
            : 'bg-rose-950/25 border-rose-500/40 shadow-rose-950/20'
        }`}>
          <div className="flex items-center justify-between text-slate-300 mb-1.5">
            <span className="text-[11px] font-bold tracking-wide uppercase">
              {timeframe === 'today' ? "Today's P&L" : 'Net P&L'}
            </span>
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-300 stroke-[2.5]" />
            )}
          </div>
          <div className={`text-2xl font-black font-mono tracking-tight ${
            isProfit ? 'text-emerald-300' : 'text-rose-300'
          }`}>
            {formatCurrency(stats.netPnl, currency)}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-medium">
            Charges: {formatCurrency(stats.totalCharges, currency)}
          </div>
        </div>

        {/* Win Rate */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/90 hover:border-slate-600 transition-all shadow-md shadow-black/20">
          <div className="flex items-center justify-between text-slate-300 mb-1.5">
            <span className="text-[11px] font-bold tracking-wide uppercase">Win Rate</span>
            <Target className="w-4 h-4 text-cyan-300 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white">
            {stats.winRate}%
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden border border-slate-700/60">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, stats.winRate)}%` }}
            />
          </div>
        </div>

        {/* Average R Multiple */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/90 hover:border-slate-600 transition-all shadow-md shadow-black/20">
          <div className="flex items-center justify-between text-slate-300 mb-1.5">
            <span className="text-[11px] font-bold tracking-wide uppercase">Average R</span>
            <Award className="w-4 h-4 text-amber-300 stroke-[2.5]" />
          </div>
          <div className={`text-2xl font-black font-mono tracking-tight ${
            isAvgRPositive ? 'text-emerald-300' : 'text-rose-300'
          }`}>
            {stats.averageR > 0 ? `+${stats.averageR}R` : `${stats.averageR}R`}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-medium">
            Expectancy: <strong className="text-white font-mono">{formatCurrency(stats.expectancy, currency)}/tr</strong>
          </div>
        </div>

        {/* Profit Factor */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/90 hover:border-slate-600 transition-all shadow-md shadow-black/20">
          <div className="flex items-center justify-between text-slate-300 mb-1.5">
            <span className="text-[11px] font-bold tracking-wide uppercase">Profit Factor</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              stats.profitFactor >= 2
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : stats.profitFactor >= 1.2
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {stats.profitFactor >= 1.5 ? 'Strong' : stats.profitFactor >= 1 ? 'Moderate' : 'Risk'}
            </span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white">
            {stats.profitFactor >= 900 ? '∞' : stats.profitFactor.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-medium">
            Discipline: <span className="text-emerald-300 font-bold font-mono">{stats.planAdherenceRate}%</span>
          </div>
        </div>

        {/* Current Drawdown */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/90 hover:border-slate-600 transition-all shadow-md shadow-black/20">
          <div className="flex items-center justify-between text-slate-300 mb-1.5">
            <span className="text-[11px] font-bold tracking-wide uppercase">Current DD</span>
            <ShieldAlert className="w-4 h-4 text-rose-300 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-rose-300">
            {stats.currentDrawdown > 0 ? `-${formatCurrency(stats.currentDrawdown, currency)}` : '₹0.00'}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 font-medium">
            Max DD: <span className="text-rose-400 font-bold font-mono">-{formatCurrency(stats.maxDrawdown, currency)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
