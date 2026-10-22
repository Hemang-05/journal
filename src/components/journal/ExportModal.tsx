'use client';

import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, Check, Database, Calendar } from 'lucide-react';
import { Trade } from '@/lib/types';
import { exportToCSV, exportToExcel, filterTradesByExportScope } from '@/lib/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: Trade[];
  filteredTrades: Trade[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  trades,
  filteredTrades,
}) => {
  const [scope, setScope] = useState<'all' | 'filtered' | 'month' | 'week'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetTrades = filterTradesByExportScope(trades, scope, filteredTrades);

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      exportToCSV(targetTrades, `trading_journal_${scope}`);
      setSuccessMessage(`Successfully exported ${targetTrades.length} trades to CSV!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      exportToExcel(targetTrades, `trading_journal_${scope}`);
      setSuccessMessage(`Successfully exported ${targetTrades.length} trades to Excel (.xlsx)!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export Trades</h3>
              <p className="text-xs text-slate-400">Export complete trading log with all 42 fields</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Scope Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Select Export Scope</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setScope('all')}
              className={`p-3 rounded-xl border text-left transition-all ${
                scope === 'all'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-white font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block font-sans">All Trades</span>
              <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{trades.length} trades</span>
            </button>

            <button
              onClick={() => setScope('filtered')}
              className={`p-3 rounded-xl border text-left transition-all ${
                scope === 'filtered'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-white font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block font-sans">Filtered View</span>
              <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{filteredTrades.length} trades</span>
            </button>

            <button
              onClick={() => setScope('month')}
              className={`p-3 rounded-xl border text-left transition-all ${
                scope === 'month'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-white font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block font-sans">Current Month</span>
              <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">This month's trades</span>
            </button>

            <button
              onClick={() => setScope('week')}
              className={`p-3 rounded-xl border text-left transition-all ${
                scope === 'week'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-white font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block font-sans">Current Week</span>
              <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">Last 7 days</span>
            </button>
          </div>
        </div>

        {/* Columns Included Note */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">Export Schema Details:</div>
          <p className="leading-relaxed">
            Includes Trade ID, Timestamps, Direction, Quantities, Entry/Exit/SL/Target Prices, Gross/Net P&L,
            R-Multiple, Charges, MAE/MFE, Strategy, Psychology Empathy & Notes, Review Learnings, Mistake Tags,
            and Screenshot URLs. (Binary images excluded to maintain clean spreadsheet size).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExportCSV}
            disabled={isExporting || targetTrades.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExporting || targetTrades.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
