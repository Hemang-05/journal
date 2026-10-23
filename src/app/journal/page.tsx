'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  Plus,
  Clock,
  Calendar,
  Layers,
  BarChart3,
  ListFilter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  Trade,
  Profile,
  FilterOptions,
  TimeframeFilter,
} from '@/lib/types';
import {
  loadTrades,
  saveTradeToStore,
  deleteTradeFromStore,
  resetStoreToSeedData,
  clearAllTradesFromStore,
  getStoredProfile,
  saveProfile,
} from '@/lib/storage';
import {
  calculatePerformanceStats,
  formatCurrency,
} from '@/lib/calculations';
import { Header } from '@/components/journal/Header';
import { QuickStats } from '@/components/journal/QuickStats';
import { TradeTable } from '@/components/journal/TradeTable';
import { TradeFilters } from '@/components/journal/TradeFilters';
import { TradeFormModal } from '@/components/journal/TradeFormModal';
import { TradeDetailModal } from '@/components/journal/TradeDetailModal';
import { AnalyticsDashboard } from '@/components/journal/AnalyticsDashboard';
import { WeeklyReview } from '@/components/journal/WeeklyReview';
import { MonthlyReview } from '@/components/journal/MonthlyReview';
import { ExportModal } from '@/components/journal/ExportModal';
import { SettingsModal } from '@/components/journal/SettingsModal';

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [profile, setProfile] = useState<Profile>({
    id: 'local-profile',
    initial_capital: 500000,
    currency: '₹',
    name: 'Hemang Mehta',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Active Main SPA Tab
  const [activeTab, setActiveTab] = useState<'journal' | 'analytics' | 'weekly' | 'monthly'>('journal');

  // Quick stats timeframe filter (today, week, month, all)
  const [statsTimeframe, setStatsTimeframe] = useState<TimeframeFilter>('today');

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);

  // Toast confirmation notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filters for Trade History Table
  const [filters, setFilters] = useState<FilterOptions>({
    timeframe: 'all',
    search: '',
    instrument: 'All',
    strategy: 'All',
    direction: 'All',
    optionType: 'All',
    marketCondition: 'All',
    result: 'All',
    psychologyTag: 'All',
  });

  const [todayDateStr, setTodayDateStr] = useState<string>('');

  // Load profile and trades on mount
  useEffect(() => {
    const init = async () => {
      const today = new Date().toISOString().split('T')[0];
      setTodayDateStr(today);
      const storedProfile = getStoredProfile();
      setProfile(storedProfile);
      const data = await loadTrades();
      setTrades(data);
      setIsLoaded(true);
    };
    init();
  }, []);

  // Global Keyboard Shortcuts (e.g. 'N' to open log trade)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setTradeToEdit(null);
        setIsLogModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered trades for QuickStats
  const statsTrades = useMemo(() => {
    if (!todayDateStr || statsTimeframe === 'all') return trades;
    const now = new Date(todayDateStr);

    if (statsTimeframe === 'today') {
      return trades.filter((t) => t.trade_date === todayDateStr);
    }
    if (statsTimeframe === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return trades.filter((t) => new Date(t.trade_date) >= oneWeekAgo);
    }
    if (statsTimeframe === 'month') {
      const monthPrefix = todayDateStr.substring(0, 7);
      return trades.filter((t) => t.trade_date.startsWith(monthPrefix));
    }
    return trades;
  }, [trades, statsTimeframe, todayDateStr]);

  // Dynamic quick performance stats
  const performanceStats = useMemo(() => {
    return calculatePerformanceStats(statsTrades, profile.initial_capital);
  }, [statsTrades, profile.initial_capital]);

  // Today's Trades specifically
  const todayTrades = useMemo(() => {
    if (!todayDateStr) return [];
    return trades.filter((t) => t.trade_date === todayDateStr);
  }, [trades, todayDateStr]);

  // Today's specific P&L
  const todayPnl = useMemo(() => {
    return todayTrades.reduce((acc, t) => acc + (Number(t.net_pnl) || 0), 0);
  }, [todayTrades]);

  // Available unique instruments for filter dropdown
  const availableInstruments = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t) => {
      if (t.instrument) set.add(t.instrument.toUpperCase());
    });
    return Array.from(set).sort();
  }, [trades]);

  // Filtered Trades for the history table
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // 1. Search Query
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesInstrument = trade.instrument.toLowerCase().includes(q);
        const matchesStrategy = trade.strategy.toLowerCase().includes(q);
        const matchesReason = trade.entry_reason?.toLowerCase().includes(q);
        const matchesLearning = trade.learning?.toLowerCase().includes(q);
        const matchesNotes = trade.psychology_notes?.toLowerCase().includes(q);
        const matchesStrike = trade.strike_price ? trade.strike_price.toString().includes(q) : false;
        const matchesOption = trade.option_type ? trade.option_type.toLowerCase().includes(q) : false;
        if (!matchesInstrument && !matchesStrategy && !matchesReason && !matchesLearning && !matchesNotes && !matchesStrike && !matchesOption) {
          return false;
        }
      }

      // 2. Instrument
      if (filters.instrument !== 'All' && trade.instrument.toUpperCase() !== filters.instrument.toUpperCase()) {
        return false;
      }

      // 3. Option Type (CE / PE)
      if (filters.optionType && filters.optionType !== 'All' && trade.option_type !== filters.optionType) {
        return false;
      }

      // 4. Strategy
      if (filters.strategy !== 'All' && trade.strategy !== filters.strategy) {
        return false;
      }

      // 5. Direction
      if (filters.direction !== 'All' && trade.direction !== filters.direction) {
        return false;
      }

      // 5. Market Condition
      if (filters.marketCondition !== 'All' && trade.market_condition !== filters.marketCondition) {
        return false;
      }

      // 6. Outcome (Result)
      if (filters.result !== 'All') {
        const net = trade.net_pnl !== null && trade.net_pnl !== undefined ? trade.net_pnl : null;
        if (filters.result === 'Winning' && (net === null || net <= 0)) return false;
        if (filters.result === 'Losing' && (net === null || net >= 0)) return false;
        if (filters.result === 'BreakEven' && (net === null || net !== 0)) return false;
      }

      // 7. Psychology Tag
      if (filters.psychologyTag !== 'All') {
        if (filters.psychologyTag === 'plan_followed' && !trade.plan_followed) return false;
        if (filters.psychologyTag === 'plan_not_followed' && trade.plan_followed) return false;
        if (filters.psychologyTag === 'fomo' && !trade.fomo) return false;
        if (filters.psychologyTag === 'revenge' && !trade.revenge_trading) return false;
        if (filters.psychologyTag === 'overtrading' && !trade.overtrading) return false;
        if (filters.psychologyTag === 'early_exit' && !trade.early_exit) return false;
      }

      return true;
    });
  }, [trades, filters]);

  // Save Trade Callback (Add or Edit)
  const handleSaveTrade = async (tradeInput: Partial<Trade>, isAnother: boolean) => {
    const saved = await saveTradeToStore(tradeInput);

    setTrades((prev) => {
      const index = prev.findIndex((t) => t.id === saved.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = saved;
        return copy;
      }
      return [saved, ...prev];
    });

    showToast(tradeInput.id ? 'Trade updated successfully!' : 'Trade logged successfully!');

    if (!isAnother) {
      setIsLogModalOpen(false);
      setTradeToEdit(null);
    }
  };

  // Delete Trade Callback
  const handleDeleteTrade = async (trade: Trade) => {
    await deleteTradeFromStore(trade.id);
    setTrades((prev) => prev.filter((t) => t.id !== trade.id));
    if (selectedTrade?.id === trade.id) {
      setSelectedTrade(null);
    }
    showToast(`Deleted trade for ${trade.instrument}.`);
  };

  // Edit Trade Callback
  const handleEditTrade = (trade: Trade) => {
    setSelectedTrade(null);
    setTradeToEdit(trade);
    setIsLogModalOpen(true);
  };

  // Duplicate Trade Callback
  const handleDuplicateTrade = (trade: Trade) => {
    setSelectedTrade(null);
    // Clone properties but omit id to log as a new trade
    const cloned: Trade = {
      ...trade,
      id: '',
      trade_date: new Date().toISOString().split('T')[0],
      entry_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      exit_time: '',
      exit_price: null,
      gross_pnl: null,
      net_pnl: null,
      r_multiple: null,
    };
    setTradeToEdit(cloned);
    setIsLogModalOpen(true);
    showToast(`Duplicated ${trade.instrument} trade parameters.`);
  };

  // Profile Save Callback
  const handleSaveProfile = async (newProfile: Profile) => {
    const saved = await saveProfile(newProfile);
    setProfile(saved);
    showToast('Profile and capital updated!');
  };

  // Reset Seed Data Callback
  const handleResetSeedData = () => {
    const fresh = resetStoreToSeedData();
    setTrades(fresh);
    showToast('Reset to 10 sample trades.');
  };

  // Clear All Trades Callback
  const handleClearAllTrades = () => {
    const empty = clearAllTradesFromStore();
    setTrades(empty);
    showToast('All trades cleared.');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0B101D] flex items-center justify-center text-slate-300 font-mono text-xs">
        Loading Trading Journal...
      </div>
    );
  }

  const handleOpenNewTrade = () => {
    setTradeToEdit(null);
    setIsLogModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0B101D] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* 1. HEADER */}
      <Header
        profile={profile}
        onOpenLogModal={handleOpenNewTrade}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Floating Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 2. QUICK STATS (Always visible on top of SPA) */}
        <QuickStats
          stats={performanceStats}
          currency={profile.currency}
          timeframe={statsTimeframe}
          setTimeframe={setStatsTimeframe}
        />

        {/* ================================================================= */}
        {/* TAB 1: JOURNAL VIEW (TODAY'S TRADES + ALL TRADES TABLE)           */}
        {/* ================================================================= */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            
            {/* TODAY'S TRADES SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Today's Trades
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {todayTrades.length} {todayTrades.length === 1 ? 'trade' : 'trades'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Today's P&L:</span>
                  <strong className={`font-bold ${todayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(todayPnl, profile.currency)}
                  </strong>
                </div>
              </div>

              <TradeTable
                trades={todayTrades}
                currency={profile.currency}
                onSelectTrade={(t) => setSelectedTrade(t)}
                onEditTrade={handleEditTrade}
                onDeleteTrade={handleDeleteTrade}
                onLogTrade={handleOpenNewTrade}
                title="Today's Trades"
              />
            </div>

            {/* ALL / FILTERED TRADES SECTION */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Trade History & Filtered Journal
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {filteredTrades.length} of {trades.length}
                  </span>
                </div>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Export View
                </button>
              </div>

              {/* Multi-Criteria Filters & Instant Search */}
              <TradeFilters
                filters={filters}
                setFilters={setFilters}
                availableInstruments={availableInstruments}
                totalCount={trades.length}
                filteredCount={filteredTrades.length}
              />

              {/* Comprehensive Trade Table */}
              <TradeTable
                trades={filteredTrades}
                currency={profile.currency}
                onSelectTrade={(t) => setSelectedTrade(t)}
                onEditTrade={handleEditTrade}
                onDeleteTrade={handleDeleteTrade}
                onLogTrade={handleOpenNewTrade}
                title="All Trades"
              />
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: ANALYTICS VIEW                                            */}
        {/* ================================================================= */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            trades={trades}
            currency={profile.currency}
            initialCapital={profile.initial_capital}
          />
        )}

        {/* ================================================================= */}
        {/* TAB 3: WEEKLY REVIEW VIEW                                        */}
        {/* ================================================================= */}
        {activeTab === 'weekly' && (
          <WeeklyReview
            trades={trades}
            currency={profile.currency}
            initialCapital={profile.initial_capital}
          />
        )}

        {/* ================================================================= */}
        {/* TAB 4: MONTHLY REVIEW VIEW                                       */}
        {/* ================================================================= */}
        {activeTab === 'monthly' && (
          <MonthlyReview
            trades={trades}
            currency={profile.currency}
            initialCapital={profile.initial_capital}
          />
        )}

      </main>

      {/* =================================================================== */}
      {/* MODALS & DRAWERS                                                   */}
      {/* =================================================================== */}

      {/* QUICK LOG TRADE FORM MODAL */}
      <TradeFormModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setTradeToEdit(null);
        }}
        onSave={handleSaveTrade}
        initialTrade={tradeToEdit}
        defaultCapital={profile.initial_capital}
        currency={profile.currency}
      />

      {/* TRADE DETAIL DRAWER / MODAL */}
      <TradeDetailModal
        trade={selectedTrade}
        currency={profile.currency}
        onClose={() => setSelectedTrade(null)}
        onEdit={handleEditTrade}
        onDuplicate={handleDuplicateTrade}
        onDelete={handleDeleteTrade}
      />

      {/* EXPORT MODAL (CSV & EXCEL) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        trades={trades}
        filteredTrades={filteredTrades}
      />

      {/* SETTINGS & SUPABASE MODAL */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onResetSeedData={handleResetSeedData}
        onClearAllTrades={handleClearAllTrades}
      />

    </div>
  );
}
