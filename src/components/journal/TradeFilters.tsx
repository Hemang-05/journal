'use client';

import React from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import { FilterOptions, COMMON_STRATEGIES } from '@/lib/types';

interface TradeFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableInstruments: string[];
  totalCount: number;
  filteredCount: number;
}

export const TradeFilters: React.FC<TradeFiltersProps> = ({
  filters,
  setFilters,
  availableInstruments,
  totalCount,
  filteredCount,
}) => {
  const isFiltered =
    filters.search ||
    filters.instrument !== 'All' ||
    filters.strategy !== 'All' ||
    filters.direction !== 'All' ||
    (filters.optionType && filters.optionType !== 'All') ||
    filters.marketCondition !== 'All' ||
    filters.result !== 'All' ||
    filters.psychologyTag !== 'All';

  const handleReset = () => {
    setFilters((prev) => ({
      ...prev,
      search: '',
      instrument: 'All',
      strategy: 'All',
      direction: 'All',
      optionType: 'All',
      marketCondition: 'All',
      result: 'All',
      psychologyTag: 'All',
    }));
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-md space-y-3">
      {/* Top Search & Reset Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            placeholder="Search instrument, strategy, reasons, learning..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 shadow-inner"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">
            Showing <strong className="text-white">{filteredCount}</strong> of {totalCount} trades
          </span>
          {isFiltered && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 text-xs">
        
        {/* Direction */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Direction</label>
          <select
            value={filters.direction}
            onChange={(e) => setFilters((prev) => ({ ...prev, direction: e.target.value as any }))}
            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Sides</option>
            <option value="Long">Long Only</option>
            <option value="Short">Short Only</option>
          </select>
        </div>

        {/* Option Type */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Option Type</label>
          <select
            value={filters.optionType || 'All'}
            onChange={(e) => setFilters((prev) => ({ ...prev, optionType: e.target.value as any }))}
            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Contracts</option>
            <option value="CE">CE (Calls)</option>
            <option value="PE">PE (Puts)</option>
          </select>
        </div>

        {/* Outcome / Result */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Outcome</label>
          <select
            value={filters.result}
            onChange={(e) => setFilters((prev) => ({ ...prev, result: e.target.value as any }))}
            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Outcomes</option>
            <option value="Winning">Winning (Win)</option>
            <option value="Losing">Losing (Loss)</option>
            <option value="BreakEven">Break-Even (BE)</option>
          </select>
        </div>

        {/* Instrument */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Instrument</label>
          <select
            value={filters.instrument}
            onChange={(e) => setFilters((prev) => ({ ...prev, instrument: e.target.value }))}
            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Tickers</option>
            {availableInstruments.map((inst) => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
        </div>

        {/* Strategy */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Strategy</label>
          <select
            value={filters.strategy}
            onChange={(e) => setFilters((prev) => ({ ...prev, strategy: e.target.value }))}
            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Strategies</option>
            {COMMON_STRATEGIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Market Condition */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Market State</label>
          <select
            value={filters.marketCondition}
            onChange={(e) => setFilters((prev) => ({ ...prev, marketCondition: e.target.value }))}
            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Conditions</option>
            <option value="Trending">Trending</option>
            <option value="Sideways">Sideways</option>
            <option value="Volatile">Volatile</option>
            <option value="Low Volatility">Low Volatility</option>
            <option value="Choppy">Choppy</option>
            <option value="Range Bound">Range Bound</option>
          </select>
        </div>

        {/* Psychology Tag */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Psychology</label>
          <select
            value={filters.psychologyTag}
            onChange={(e) => setFilters((prev) => ({ ...prev, psychologyTag: e.target.value as any }))}
            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Mindsets</option>
            <option value="plan_followed">Plan Followed (Disciplined)</option>
            <option value="plan_not_followed">Plan Violated</option>
            <option value="fomo">FOMO Trades</option>
            <option value="revenge">Revenge Trades</option>
            <option value="overtrading">Overtrading</option>
            <option value="early_exit">Early Exit</option>
          </select>
        </div>

      </div>
    </div>
  );
};
