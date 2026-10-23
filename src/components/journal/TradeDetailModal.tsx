'use client';

import React, { useState } from 'react';
import {
  X,
  Edit3,
  Copy,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Shield,
  Layers,
  Brain,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ZoomIn,
} from 'lucide-react';
import { Trade } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

interface TradeDetailModalProps {
  trade: Trade | null;
  currency?: string;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDuplicate: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  currency = '₹',
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!trade) return null;

  const isProfit = trade.net_pnl !== null && trade.net_pnl !== undefined && trade.net_pnl > 0;
  const isLoss = trade.net_pnl !== null && trade.net_pnl !== undefined && trade.net_pnl < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0D1322] border border-slate-700/90 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span
              className={`p-2 rounded-xl text-xs font-bold inline-flex items-center gap-1 ${
                trade.direction === 'Long'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {trade.direction === 'Long' ? (
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
              )}
              {trade.direction}
            </span>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {trade.instrument}
                </h2>
                {trade.strike_price && (
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {trade.strike_price}
                  </span>
                )}
                {trade.option_type && (
                  <span
                    className={`text-xs font-sans font-black px-2 py-0.5 rounded border ${
                      trade.option_type === 'CE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {trade.option_type}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {trade.instrument_type}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {trade.trade_date} ({trade.entry_time}{trade.exit_time ? ` - ${trade.exit_time}` : ''})
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Strategy: <strong className="text-slate-200">{trade.strategy}</strong>
                {trade.custom_strategy && ` • ${trade.custom_strategy}`}
                {trade.timeframe && ` • ${trade.timeframe}`}
                {trade.market_condition && ` • ${trade.market_condition}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicate(trade)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Duplicate trade for fast entry"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(trade)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
              title="Edit trade"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Delete trade"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Highlighted Results Banner */}
        <div className={`px-6 py-3 border-b flex items-center justify-between flex-wrap gap-2 ${
          isProfit ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300' : isLoss ? 'bg-rose-950/30 border-rose-500/20 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Net P&L</span>
              <span className="text-xl font-bold font-mono tracking-tight">
                {formatCurrency(trade.net_pnl, currency)}
                {trade.net_pnl_percent !== null && trade.net_pnl_percent !== undefined && (
                  <span className="text-xs font-normal ml-1">({trade.net_pnl_percent}%)</span>
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">R-Multiple</span>
              <span className="text-lg font-bold font-mono">
                {trade.r_multiple !== null && trade.r_multiple !== undefined
                  ? trade.r_multiple > 0
                    ? `+${trade.r_multiple}R`
                    : `${trade.r_multiple}R`
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross P&L</span>
              <span className="text-sm font-mono">{formatCurrency(trade.gross_pnl, currency)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Charges</span>
              <span className="text-sm font-mono">
                {formatCurrency((Number(trade.brokerage) || 0) + (Number(trade.charges) || 0), currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {trade.plan_followed ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Plan Followed
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Plan Violated
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Trade Execution & Prices Grid */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Trade Execution & Risk Parameters
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Entry Price</span>
                <span className="text-sm font-bold font-mono text-white">
                  {trade.entry_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Exit Price</span>
                <span className="text-sm font-bold font-mono text-white">
                  {trade.exit_price !== null && trade.exit_price !== undefined
                    ? trade.exit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                    : '—'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Stop Loss</span>
                <span className="text-sm font-bold font-mono text-rose-400">
                  {trade.stop_loss ? trade.stop_loss.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Target</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {trade.target ? trade.target.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 text-[11px]">Quantity:</span>{' '}
                <strong className="text-white font-mono">{trade.quantity}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Planned Risk:</span>{' '}
                <strong className="text-white font-mono">{formatCurrency(trade.risk_amount, currency)}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Planned R:R:</span>{' '}
                <strong className="text-white font-mono">{trade.planned_rr ? `1:${trade.planned_rr}` : '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">MAE / MFE:</span>{' '}
                <strong className="text-white font-mono">
                  {trade.mae || '—'} / {trade.mfe || '—'}
                </strong>
              </div>
            </div>

            {(trade.strike_price || trade.option_type || trade.expiry_date) && (
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-4 text-xs flex-wrap">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">Option Contract:</span>
                {trade.strike_price && (
                  <span>
                    Strike: <strong className="font-mono text-amber-300 font-bold">{trade.strike_price}</strong>
                  </span>
                )}
                {trade.option_type && (
                  <span>
                    Type:{' '}
                    <strong className={trade.option_type === 'CE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {trade.option_type} ({trade.option_type === 'CE' ? 'Call' : 'Put'})
                    </strong>
                  </span>
                )}
                {trade.expiry_date && (
                  <span>
                    Expiry: <strong className="font-mono text-slate-300">{trade.expiry_date}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Entry Reason */}
          {trade.entry_reason && (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Entry Reason
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {trade.entry_reason}
              </p>
            </div>
          )}

          {/* Chart Screenshots */}
          {(trade.entry_screenshot_url || trade.exit_screenshot_url) && (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                Chart Screenshots
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trade.entry_screenshot_url && (
                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-black">
                    <div className="px-3 py-1 bg-slate-950 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                      Entry Screenshot
                    </div>
                    <img
                      src={trade.entry_screenshot_url}
                      alt="Entry chart"
                      className="w-full aspect-video object-contain cursor-pointer hover:opacity-90"
                      onClick={() => setActiveImage(trade.entry_screenshot_url || null)}
                    />
                  </div>
                )}

                {trade.exit_screenshot_url && (
                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-black">
                    <div className="px-3 py-1 bg-slate-950 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                      Exit Screenshot
                    </div>
                    <img
                      src={trade.exit_screenshot_url}
                      alt="Exit chart"
                      className="w-full aspect-video object-contain cursor-pointer hover:opacity-90"
                      onClick={() => setActiveImage(trade.exit_screenshot_url || null)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Psychology & Discipline Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-pink-400" />
              Psychology & Mindset
            </h3>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Before</span>
                <span className="text-xs font-semibold text-slate-200">{trade.before_emotion || '—'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">During</span>
                <span className="text-xs font-semibold text-slate-200">{trade.during_emotion || '—'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">After</span>
                <span className="text-xs font-semibold text-slate-200">{trade.after_emotion || '—'}</span>
              </div>
            </div>

            {/* Psychological Traps */}
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              {trade.fomo && (
                <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                  FOMO Encountered
                </span>
              )}
              {trade.revenge_trading && (
                <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                  Revenge Trade
                </span>
              )}
              {trade.overtrading && (
                <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                  Overtrading
                </span>
              )}
              {trade.early_exit && (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  Early Exit
                </span>
              )}
            </div>

            {trade.psychology_notes && (
              <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800/60">
                "{trade.psychology_notes}"
              </p>
            )}
          </div>

          {/* Review, Mistakes & Learnings */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Review & Takeaways
            </h3>

            {/* Mistakes & Execution Tags */}
            {trade.mistake_tags && trade.mistake_tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-2">
                {trade.mistake_tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      tag === 'Followed Plan' || tag === 'Perfect Execution'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-semibold'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {trade.what_went_well && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1">What went well</span>
                  <p className="text-slate-300">{trade.what_went_well}</p>
                </div>
              )}
              {trade.what_went_wrong && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-semibold text-rose-400 block mb-1">What went wrong</span>
                  <p className="text-slate-300">{trade.what_went_wrong}</p>
                </div>
              )}
              {trade.learning && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-semibold text-cyan-400 block mb-1">Key Learning</span>
                  <p className="text-slate-300">{trade.learning}</p>
                </div>
              )}
              {trade.next_time && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-semibold text-amber-400 block mb-1">Next Time Action</span>
                  <p className="text-slate-300">{trade.next_time}</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-6 text-center">
            <div className="max-w-sm space-y-4">
              <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Delete this trade record?</h4>
              <p className="text-xs text-slate-400">
                This will permanently delete this trade for {trade.instrument} on {trade.trade_date}. This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(trade);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
