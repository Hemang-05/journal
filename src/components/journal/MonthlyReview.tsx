'use client';

import React, { useMemo } from 'react';
import { Calendar, TrendingUp, Award, Clock, AlertTriangle, ShieldCheck, PieChart as PieIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Trade } from '@/lib/types';
import {
  calculatePerformanceStats,
  buildEquityCurve,
  calculateMistakeAnalysis,
  calculatePsychologyPerformance,
  formatCurrency,
} from '@/lib/calculations';

interface MonthlyReviewProps {
  trades: Trade[];
  currency?: string;
  initialCapital?: number;
}

export const MonthlyReview: React.FC<MonthlyReviewProps> = ({
  trades,
  currency = '₹',
  initialCapital = 500000,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState<string>('');

  React.useEffect(() => {
    setCurrentMonth(new Date().toISOString().substring(0, 7));
  }, []);

  // Current month trades
  const monthlyTrades = useMemo(() => {
    if (!currentMonth) return trades;
    return trades.filter((t) => t.trade_date.startsWith(currentMonth));
  }, [trades, currentMonth]);

  const stats = useMemo(() => {
    return calculatePerformanceStats(monthlyTrades, initialCapital);
  }, [monthlyTrades, initialCapital]);

  const equityData = useMemo(() => {
    return buildEquityCurve(monthlyTrades, initialCapital);
  }, [monthlyTrades, initialCapital]);

  const mistakes = useMemo(() => {
    return calculateMistakeAnalysis(monthlyTrades);
  }, [monthlyTrades]);

  const psychology = useMemo(() => {
    return calculatePsychologyPerformance(monthlyTrades);
  }, [monthlyTrades]);

  const isProfit = stats.netPnl >= 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Monthly Deep-Dive Retrospective
          </h2>
          <p className="text-xs text-slate-400">
            Comprehensive review of current month profitability, capital curve, and psychology.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
          This Month • {monthlyTrades.length} Trades
        </span>
      </div>

      {/* Monthly Content */}
      {monthlyTrades.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl shadow-black/20">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Calendar className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">No trades recorded this month</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
            Monthly equity progression curves, win rate consistency, drawdown peaks, and discipline statistics will illuminate here as you log trades.
          </p>
        </div>
      ) : (
        <>
      {/* Monthly KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`p-4 rounded-xl border ${isProfit ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly P&L</span>
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
            Avg Win: +{formatCurrency(stats.averageWin, currency)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Profit Factor</span>
          <span className="text-xl font-bold font-mono text-white">
            {stats.profitFactor >= 900 ? '∞' : stats.profitFactor.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Avg R: <strong className="text-emerald-400">{stats.averageR > 0 ? `+${stats.averageR}R` : `${stats.averageR}R`}</strong>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Max Drawdown</span>
          <span className="text-xl font-bold font-mono text-rose-400">
            -{formatCurrency(stats.maxDrawdown, currency)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Peak: {formatCurrency(stats.peakEquity, currency)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Best / Worst Setup</span>
          <span className="text-xs font-bold text-emerald-400 truncate block">{stats.bestStrategy}</span>
          <span className="text-[11px] text-rose-400 truncate block mt-0.5">
            Worst: {stats.worstStrategy}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Plan Adherence</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{stats.planAdherenceRate}%</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Best Day: {stats.bestDayOfWeek}
          </span>
        </div>
      </div>

      {/* Monthly Equity Curve */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Monthly Equity Progression
            </h3>
            <p className="text-xs text-slate-400">Chronological net growth across current month.</p>
          </div>
          <span className="text-xs font-mono text-slate-300">
            Current Equity: <strong className="text-white">{formatCurrency(stats.currentEquity, currency)}</strong>
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="tradeNumber" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono">
                        <div className="text-slate-400">{d.date} • {d.instrument}</div>
                        <div className="text-white font-bold">Cumulative: {formatCurrency(d.cumulativeNetPnl, currency)}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeNetPnl"
                stroke="#06B6D4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#monthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Psychology & Discipline Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Monthly Discipline Breakdown
          </h3>
          <div className="space-y-2">
            {psychology.map((p) => (
              <div key={p.category} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between text-xs font-mono">
                <div>
                  <span className="font-sans font-semibold text-slate-200">{p.category}</span>
                  <span className="text-[11px] text-slate-500 ml-2">({p.trades} trades)</span>
                </div>
                <div className={p.netPnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {formatCurrency(p.netPnl, currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Monthly Mistakes & Cost
          </h3>
          {mistakes.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No trading errors recorded this month!
            </div>
          ) : (
            <div className="space-y-2">
              {mistakes.map((m) => (
                <div key={m.tag} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between text-xs font-mono">
                  <div>
                    <span className="font-sans font-semibold text-slate-200">{m.tag}</span>
                    <span className="text-[11px] text-slate-500 ml-2">({m.count}x)</span>
                  </div>
                  <div className="text-rose-400 font-bold">
                    {formatCurrency(m.netPnlImpact, currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </>
      )}

    </div>
  );
};
