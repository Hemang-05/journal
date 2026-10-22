'use client';

import React, { useMemo } from 'react';
import { Calendar, Target, Award, ShieldAlert, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { Trade } from '@/lib/types';
import {
  calculatePerformanceStats,
  calculateMistakeAnalysis,
  generateWeeklyActionableInsights,
  formatCurrency,
} from '@/lib/calculations';

interface WeeklyReviewProps {
  trades: Trade[];
  currency?: string;
  initialCapital?: number;
}

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({
  trades,
  currency = '₹',
  initialCapital = 500000,
}) => {
  const [cutoffDate, setCutoffDate] = React.useState<string>('');

  React.useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    setCutoffDate(d.toISOString().split('T')[0]);
  }, []);

  // Filter for trades in the last 7 days
  const weeklyTrades = useMemo(() => {
    if (!cutoffDate) return trades;
    return trades.filter((t) => t.trade_date >= cutoffDate);
  }, [trades, cutoffDate]);

  const stats = useMemo(() => {
    return calculatePerformanceStats(weeklyTrades, initialCapital);
  }, [weeklyTrades, initialCapital]);

  const mistakes = useMemo(() => {
    return calculateMistakeAnalysis(weeklyTrades);
  }, [weeklyTrades]);

  const actionableInsights = useMemo(() => {
    return generateWeeklyActionableInsights(weeklyTrades, stats);
  }, [weeklyTrades, stats]);

  const isProfit = stats.netPnl >= 0;
  const mostCommonMistake = mistakes.length > 0 ? `${mistakes[0].tag} (${mistakes[0].count}x)` : 'None recorded';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Weekly Performance & Discipline Review
          </h2>
          <p className="text-xs text-slate-400">
            Automated retrospective generated strictly from your past 7 days of trading data.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
          Last 7 Days • {weeklyTrades.length} Trades
        </span>
      </div>

      {/* Content */}
      {weeklyTrades.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl shadow-black/20">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Calendar className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">No trades recorded in the past 7 days</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
            As you log your trading sessions, automated weekly retrospectives, best setups, discipline compliance scores, and actionable weekly focus rules will generate here automatically.
          </p>
        </div>
      ) : (
        <>
      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`p-4 rounded-xl border ${isProfit ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekly Net P&L</span>
          <span className={`text-xl font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(stats.netPnl, currency)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {stats.winningTrades}W / {stats.losingTrades}L
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Win Rate</span>
          <span className="text-xl font-bold font-mono text-white">{stats.winRate}%</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Avg R: <strong className={stats.averageR >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{stats.averageR > 0 ? `+${stats.averageR}R` : `${stats.averageR}R`}</strong>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Plan Adherence</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{stats.planAdherenceRate}%</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Discipline benchmark: 85%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Top Strategy</span>
          <span className="text-sm font-bold text-white truncate block">{stats.bestStrategy}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Worst: <strong className="text-slate-300">{stats.worstStrategy}</strong>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Best Time Slot</span>
          <span className="text-sm font-bold text-emerald-400 truncate block">{stats.bestTimeSlot}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Worst: <span className="text-rose-400">{stats.worstTimeSlot}</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Frequent Mistake</span>
          <span className="text-xs font-bold text-rose-400 truncate block">{mostCommonMistake}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Max DD: -{formatCurrency(stats.maxDrawdown, currency)}
          </span>
        </div>
      </div>

      {/* DYNAMIC ACTIONABLE INSIGHTS: "What should I focus on next week?" */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0F172A] border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">What should I focus on next week?</h3>
            <p className="text-xs text-slate-400">
              Rule-based trading adjustments computed strictly from your execution data.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {actionableInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

    </div>
  );
};
