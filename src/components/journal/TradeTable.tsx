'use client';

import React from 'react';
import { Eye, Edit3, Trash2, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, Clock, Plus } from 'lucide-react';
import { Trade } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

interface TradeTableProps {
  trades: Trade[];
  currency?: string;
  onSelectTrade: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (trade: Trade) => void;
  onLogTrade?: () => void;
  title?: string;
}

export const TradeTable: React.FC<TradeTableProps> = ({
  trades,
  currency = '₹',
  onSelectTrade,
  onEditTrade,
  onDeleteTrade,
  onLogTrade,
  title = "Today's Trades",
}) => {
  if (trades.length === 0) {
    return (
      <div className="p-10 text-center rounded-2xl bg-slate-900/70 border border-slate-700/80 shadow-lg shadow-black/20">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Clock className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">No trades recorded yet</h3>
        <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
          Your journal is empty and ready for trades. Click below to quickly log your first trade in under 60 seconds.
        </p>
        {onLogTrade && (
          <div className="mt-4">
            <button
              onClick={onLogTrade}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-lg shadow-lg shadow-emerald-400/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Your First Trade</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/80 shadow-xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900 text-[11px] font-bold text-slate-200 uppercase tracking-wider">
              <th className="py-3 px-3.5">Time / Date</th>
              <th className="py-3 px-3">Instrument</th>
              <th className="py-3 px-3">Side</th>
              <th className="py-3 px-3">Strategy</th>
              <th className="py-3 px-3 text-right">Entry</th>
              <th className="py-3 px-3 text-right">Exit</th>
              <th className="py-3 px-3 text-right">Qty</th>
              <th className="py-3 px-3.5 text-right">Net P&L</th>
              <th className="py-3 px-3 text-center">R</th>
              <th className="py-3 px-3 text-center">Plan</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-mono">
            {trades.map((trade) => {
              const net = trade.net_pnl !== null && trade.net_pnl !== undefined ? trade.net_pnl : null;
              const isProfit = net !== null && net > 0;
              const isLoss = net !== null && net < 0;
              const r = trade.r_multiple;

              return (
                <tr
                  key={trade.id}
                  onClick={() => onSelectTrade(trade)}
                  className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  {/* Time & Date */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-200">
                    <span className="font-bold text-white">{trade.entry_time || '—'}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5 font-sans block sm:inline">
                      {trade.trade_date}
                    </span>
                  </td>

                  {/* Instrument */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-white tracking-tight">{trade.instrument}</span>
                      <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {trade.instrument_type}
                      </span>
                    </div>
                  </td>

                  {/* Direction / Side */}
                  <td className="py-3 px-3 whitespace-nowrap font-sans">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                        trade.direction === 'Long'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {trade.direction === 'Long' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      {trade.direction}
                    </span>
                  </td>

                  {/* Strategy */}
                  <td className="py-3 px-3 whitespace-nowrap font-sans text-slate-200">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {trade.strategy || '—'}
                    </span>
                  </td>

                  {/* Entry Price */}
                  <td className="py-3 px-3 text-right text-slate-200 font-semibold">
                    {trade.entry_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Exit Price */}
                  <td className="py-3 px-3 text-right text-slate-200 font-semibold">
                    {trade.exit_price !== null && trade.exit_price !== undefined
                      ? trade.exit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                      : '—'}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 text-right text-slate-300 font-bold">
                    {trade.quantity}
                  </td>

                  {/* Net P&L */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    {net !== null ? (
                      <span
                        className={`font-black text-sm ${
                          isProfit ? 'text-emerald-300' : isLoss ? 'text-rose-300' : 'text-slate-300'
                        }`}
                      >
                        {formatCurrency(net, currency)}
                      </span>
                    ) : (
                      <span className="text-amber-400 text-[10px] font-bold">OPEN</span>
                    )}
                  </td>

                  {/* R Multiple */}
                  <td className="py-3 px-3 text-center whitespace-nowrap font-sans">
                    {r !== null && r !== undefined ? (
                      <span
                        className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-md ${
                          r > 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : r < 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {r > 0 ? `+${r}R` : `${r}R`}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Plan Followed */}
                  <td className="py-3 px-3 text-center font-sans">
                    {trade.plan_followed ? (
                      <span className="inline-flex items-center text-emerald-300" title="Plan Followed">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-rose-300" title="Plan Violated">
                        <XCircle className="w-4 h-4" />
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectTrade(trade)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        title="View trade details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditTrade(trade)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
                        title="Edit trade"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTrade(trade)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-slate-800 transition-colors"
                        title="Delete trade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
