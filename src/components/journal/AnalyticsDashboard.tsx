'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  PieChart as PieIcon,
  Clock,
  Calendar,
  Brain,
  AlertTriangle,
  Award,
  Zap,
} from 'lucide-react';
import { Trade, TimeframeFilter } from '@/lib/types';
import {
  calculatePerformanceStats,
  buildEquityCurve,
  buildDailyPnl,
  calculateStrategyPerformance,
  calculateTimeSlotPerformance,
  calculateDayOfWeekPerformance,
  calculatePsychologyPerformance,
  calculateMistakeAnalysis,
  formatCurrency,
} from '@/lib/calculations';

interface AnalyticsDashboardProps {
  trades: Trade[];
  currency?: string;
  initialCapital?: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  trades,
  currency = '₹',
  initialCapital = 500000,
}) => {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<TimeframeFilter>('all');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  useEffect(() => {
    setCurrentDateStr(new Date().toISOString().split('T')[0]);
  }, []);

  // Filter trades by selected analytics period
  const filteredTrades = useMemo(() => {
    if (!currentDateStr || analyticsPeriod === 'all') return trades;
    const now = new Date(currentDateStr);

    if (analyticsPeriod === 'today') {
      return trades.filter((t) => t.trade_date === currentDateStr);
    }
    if (analyticsPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return trades.filter((t) => new Date(t.trade_date) >= weekAgo);
    }
    if (analyticsPeriod === 'month') {
      const monthPrefix = currentDateStr.substring(0, 7);
      return trades.filter((t) => t.trade_date.startsWith(monthPrefix));
    }
    if (analyticsPeriod === 'quarter') {
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return trades.filter((t) => new Date(t.trade_date) >= quarterAgo);
    }
    if (analyticsPeriod === 'year') {
      const currentYear = currentDateStr.substring(0, 4);
      return trades.filter((t) => t.trade_date.startsWith(currentYear));
    }
    return trades;
  }, [trades, analyticsPeriod, currentDateStr]);

  // Dynamic calculations
  const stats = useMemo(() => {
    return calculatePerformanceStats(filteredTrades, initialCapital);
  }, [filteredTrades, initialCapital]);

  const equityData = useMemo(() => {
    return buildEquityCurve(filteredTrades, initialCapital);
  }, [filteredTrades, initialCapital]);

  const dailyPnlData = useMemo(() => {
    return buildDailyPnl(filteredTrades);
  }, [filteredTrades]);

  const strategyData = useMemo(() => {
    return calculateStrategyPerformance(filteredTrades);
  }, [filteredTrades]);

  const timeSlotData = useMemo(() => {
    return calculateTimeSlotPerformance(filteredTrades);
  }, [filteredTrades]);

  const dayOfWeekData = useMemo(() => {
    return calculateDayOfWeekPerformance(filteredTrades);
  }, [filteredTrades]);

  const psychologyData = useMemo(() => {
    return calculatePsychologyPerformance(filteredTrades);
  }, [filteredTrades]);

  const mistakeData = useMemo(() => {
    return calculateMistakeAnalysis(filteredTrades);
  }, [filteredTrades]);

  // Win/Loss distribution for Pie Chart
  const winLossDistribution = useMemo(() => {
    return [
      { name: 'Wins', value: stats.winningTrades, color: '#10B981' },
      { name: 'Losses', value: stats.losingTrades, color: '#F43F5E' },
      { name: 'Break-Even', value: stats.breakEvenTrades, color: '#64748B' },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Custom Chart Tooltips
  const CustomEquityTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg shadow-xl text-xs font-mono">
          <div className="text-slate-400 font-sans mb-1">{data.date} (Trade #{data.tradeNumber})</div>
          <div className="text-white font-bold">{data.instrument}</div>
          <div className="text-slate-300">
            Trade P&L: <span className={data.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatCurrency(data.pnl, currency)}</span>
          </div>
          <div className="text-slate-300">
            Cumulative: <span className="text-white font-bold">{formatCurrency(data.cumulativeNetPnl, currency)}</span>
          </div>
          <div className="text-rose-400 text-[11px]">
            Drawdown: -{formatCurrency(data.drawdown, currency)}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDailyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg shadow-xl text-xs font-mono">
          <div className="text-slate-400 font-sans mb-1">{data.date}</div>
          <div className={data.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            Net P&L: {formatCurrency(data.pnl, currency)}
          </div>
          <div className="text-slate-300 text-[11px]">Trades: {data.tradesCount} (Win Rate: {data.winRate}%)</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Time Period Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Performance & Psychological Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Identify edges, statistical expectancy, and cognitive leakages.
          </p>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          {(
            [
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: 'quarter', label: 'Quarter' },
              { key: 'year', label: 'Year' },
              { key: 'all', label: 'All Time' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setAnalyticsPeriod(item.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                analyticsPeriod === item.key
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid (Section 15 Requirements) */}
      {filteredTrades.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl shadow-black/20">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">No analytics data for this period</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
            Equity curve, daily P&L, strategy matrices, session time breakdowns, and psychological leakage metrics will automatically generate as you log trades.
          </p>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Win Rate</span>
          <span className="text-xl font-bold font-mono text-white">{stats.winRate}%</span>
          <span className="text-[11px] text-slate-300 block mt-0.5 font-medium">
            {stats.winningTrades}W / {stats.losingTrades}L / {stats.breakEvenTrades}BE
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Expectancy</span>
          <span className={`text-xl font-bold font-mono ${stats.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(stats.expectancy, currency)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">per trade edge</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Profit Factor</span>
          <span className="text-xl font-bold font-mono text-white">
            {stats.profitFactor >= 900 ? '∞' : stats.profitFactor.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Avg R: <strong className="text-emerald-400">{stats.averageR > 0 ? `+${stats.averageR}R` : `${stats.averageR}R`}</strong>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Win / Loss</span>
          <div className="text-xs font-mono font-bold mt-1 space-y-0.5">
            <div className="text-emerald-400">+{formatCurrency(stats.averageWin, currency)}</div>
            <div className="text-rose-400">-{formatCurrency(stats.averageLoss, currency)}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Max Drawdown</span>
          <span className="text-xl font-bold font-mono text-rose-400">
            -{formatCurrency(stats.maxDrawdown, currency)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Peak: {formatCurrency(stats.peakEquity, currency)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Plan Adherence</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{stats.planAdherenceRate}%</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Best Slot: <strong className="text-white">{stats.bestTimeSlot}</strong>
          </span>
        </div>
      </div>

      {/* CHART 1: EQUITY CURVE & RUNNING DRAWDOWN */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Equity Curve (Cumulative Net P&L)
            </h3>
            <p className="text-xs text-slate-400">
              Chronological equity progression across closed trades.
            </p>
          </div>
          <div className="text-xs font-mono text-right">
            <span className="text-slate-400">Net Profit: </span>
            <strong className={`text-sm ${stats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(stats.netPnl, currency)}
            </strong>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="tradeNumber" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip content={<CustomEquityTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeNetPnl"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#equityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 2: DAILY P&L BAR CHART + WIN/LOSS DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 2: DAILY P&L */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                Daily P&L Distribution
              </h3>
              <p className="text-xs text-slate-400">Green = Net positive days, Red = Net negative days</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnlData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip content={<CustomDailyTooltip />} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {dailyPnlData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#F43F5E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: WIN / LOSS / BREAKEVEN DONUT */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-400" />
              Outcome Distribution
            </h3>
            <p className="text-xs text-slate-400">Win Rate vs Losses & Scratches</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winLossDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {winLossDistribution.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      const pct = stats.totalTrades > 0 ? ((d.value / stats.totalTrades) * 100).toFixed(1) : 0;
                      return (
                        <div className="p-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono">
                          <span style={{ color: d.color }}>{d.name}</span>: {d.value} ({pct}%)
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around text-xs font-mono border-t border-slate-800/80 pt-2">
            <div className="text-center">
              <span className="text-emerald-400 font-bold block">{stats.winningTrades}</span>
              <span className="text-[10px] text-slate-500">Wins ({stats.winRate}%)</span>
            </div>
            <div className="text-center">
              <span className="text-rose-400 font-bold block">{stats.losingTrades}</span>
              <span className="text-[10px] text-slate-500">Losses ({stats.lossRate}%)</span>
            </div>
            <div className="text-center">
              <span className="text-slate-400 font-bold block">{stats.breakEvenTrades}</span>
              <span className="text-[10px] text-slate-500">B/E</span>
            </div>
          </div>
        </div>

      </div>

      {/* ROW 3: STRATEGY PERFORMANCE TABLE & CHART */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Setup & Strategy Performance Matrix
            </h3>
            <p className="text-xs text-slate-400">Measure expectancy and profit factor for each specific setup.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-3">Strategy</th>
                <th className="py-2.5 px-3 text-right">Trades</th>
                <th className="py-2.5 px-3 text-right">Win Rate</th>
                <th className="py-2.5 px-3 text-right">Net P&L</th>
                <th className="py-2.5 px-3 text-right">Avg P&L</th>
                <th className="py-2.5 px-3 text-right">Avg R</th>
                <th className="py-2.5 px-3 text-right">Profit Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {strategyData.map((s) => (
                <tr key={s.strategy} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    {s.strategy}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{s.trades}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={s.winRate >= 50 ? 'text-emerald-400' : 'text-slate-400'}>
                      {s.winRate}%
                    </span>
                  </td>
                  <td className={`py-2.5 px-3 text-right font-bold ${s.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(s.netPnl, currency)}
                  </td>
                  <td className={`py-2.5 px-3 text-right ${s.averagePnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(s.averagePnl, currency)}
                  </td>
                  <td className={`py-2.5 px-3 text-right ${s.averageR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {s.averageR > 0 ? `+${s.averageR}R` : `${s.averageR}R`}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {s.profitFactor >= 900 ? '∞' : s.profitFactor.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 4: TIME-OF-DAY & DAY-OF-WEEK BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TIME OF DAY */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Time-of-Day Performance
            </h3>
            <p className="text-xs text-slate-400">P&L by session time slot</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSlotData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="slot" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono">
                          <div className="text-slate-400 mb-0.5">{d.slot}</div>
                          <div className={d.netPnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            Net P&L: {formatCurrency(d.netPnl, currency)}
                          </div>
                          <div className="text-slate-400">Trades: {d.trades} (Win: {d.winRate}%)</div>
                          <div className="text-slate-400">Avg R: {d.averageR}R</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                  {timeSlotData.map((entry, index) => (
                    <Cell key={`time-cell-${index}`} fill={entry.netPnl >= 0 ? '#10B981' : '#F43F5E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DAY OF WEEK */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Day-of-Week Performance
            </h3>
            <p className="text-xs text-slate-400">Monday to Friday breakdown</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono">
                          <div className="text-slate-400 mb-0.5">{d.day}</div>
                          <div className={d.netPnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            Net P&L: {formatCurrency(d.netPnl, currency)}
                          </div>
                          <div className="text-slate-400">Trades: {d.trades} (Win: {d.winRate}%)</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                  {dayOfWeekData.map((entry, index) => (
                    <Cell key={`day-cell-${index}`} fill={entry.netPnl >= 0 ? '#10B981' : '#F43F5E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ROW 5: PSYCHOLOGY & MISTAKE COST ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PSYCHOLOGY COMPARISON */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-pink-400" />
              Psychology Performance Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Direct comparison: Following plan vs violating plan & emotional traps.
            </p>
          </div>

          <div className="space-y-2.5">
            {psychologyData.map((item) => (
              <div
                key={item.category}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="font-sans font-semibold text-slate-200 block">{item.category}</span>
                  <span className="text-[11px] text-slate-500">
                    {item.trades} trades • Win Rate: {item.winRate}%
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${item.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(item.netPnl, currency)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Avg: {formatCurrency(item.avgPnl, currency)}/tr
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MISTAKE ANALYSIS & FINANCIAL IMPACT */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Mistake Impact & Financial Leakage
            </h3>
            <p className="text-xs text-slate-400">
              How much money did each trading error cost you?
            </p>
          </div>

          {mistakeData.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No mistakes logged for this period! Excellent discipline.
            </div>
          ) : (
            <div className="space-y-2.5">
              {mistakeData.map((item) => (
                <div
                  key={item.tag}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <div>
                      <span className="font-sans font-semibold text-slate-200 block">{item.tag}</span>
                      <span className="text-[11px] text-slate-500">{item.count} occurrences</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-400 block">
                      {formatCurrency(item.netPnlImpact, currency)}
                    </span>
                    <span className="text-[10px] text-slate-500">Combined impact</span>
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
