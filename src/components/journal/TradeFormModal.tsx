'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Upload,
  Trash2,
  Sparkles,
  Calculator,
  Shield,
  Layers,
  Brain,
  BookOpen,
  Image as ImageIcon,
  Check,
  AlertCircle,
  AlertTriangle,
  Target,
} from 'lucide-react';
import {
  Trade,
  Direction,
  InstrumentType,
  OptionType,
  PositionSizeMethod,
  MarketCondition,
  Timeframe,
  BeforeEmotion,
  DuringEmotion,
  AfterEmotion,
  COMMON_STRATEGIES,
  COMMON_MISTAKES,
} from '@/lib/types';
import { calculateTradeFinancials, calculatePositionSize, formatCurrency } from '@/lib/calculations';
import { uploadScreenshot } from '@/lib/storage';

interface TradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Partial<Trade>, isAnother: boolean) => Promise<void>;
  initialTrade?: Trade | null;
  defaultCapital?: number;
  currency?: string;
}

const COMMON_INSTRUMENTS = [
  'NIFTY',
  'BANKNIFTY',
  'FINNIFTY',
  'RELIANCE',
  'TCS',
  'HDFCBANK',
  'INFY',
  'BTCUSD',
  'ETHUSD',
  'EURUSD',
  'GOLD',
  'CRUDEOIL',
];

export const TradeFormModal: React.FC<TradeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTrade,
  defaultCapital = 500000,
  currency = '₹',
}) => {
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    basic: true, // Open by default
    risk: false,
    calculations: false,
    strategy: false,
    screenshots: false,
    psychology: false,
    review: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Basic Form State
  const [tradeDate, setTradeDate] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [instrument, setInstrument] = useState('NIFTY');
  const [instrumentType, setInstrumentType] = useState<InstrumentType>('NIFTY');
  const [market, setMarket] = useState<string>('F&O');
  const [contractType, setContractType] = useState<string>('PE');
  const [strikePrice, setStrikePrice] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [direction, setDirection] = useState<Direction>('Long');
  const [quantity, setQuantity] = useState<string>('50');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [target, setTarget] = useState<string>('');

  // Risk & Position Size State
  const [accountCapital, setAccountCapital] = useState<string>(defaultCapital.toString());
  const [riskPercent, setRiskPercent] = useState<string>('1');
  const [positionSizeMethod, setPositionSizeMethod] = useState<PositionSizeMethod>('manual');

  // Charges & Excursion
  const [brokerage, setBrokerage] = useState<string>('40');
  const [charges, setCharges] = useState<string>('20');
  const [mae, setMae] = useState<string>('');
  const [mfe, setMfe] = useState<string>('');

  // Strategy & Setup
  const [strategy, setStrategy] = useState<string>('Breakout');
  const [customStrategy, setCustomStrategy] = useState<string>('');
  const [entryReason, setEntryReason] = useState<string>('');
  const [marketCondition, setMarketCondition] = useState<string>('Trending');
  const [timeframe, setTimeframe] = useState<string>('5m');

  // Screenshots
  const [entryScreenshotUrl, setEntryScreenshotUrl] = useState<string | null>(null);
  const [exitScreenshotUrl, setExitScreenshotUrl] = useState<string | null>(null);
  const [uploadingEntry, setUploadingEntry] = useState(false);
  const [uploadingExit, setUploadingExit] = useState(false);

  // Psychology
  const [beforeEmotion, setBeforeEmotion] = useState<string>('Confident');
  const [duringEmotion, setDuringEmotion] = useState<string>('Calm');
  const [afterEmotion, setAfterEmotion] = useState<string>('Satisfied');
  const [planFollowed, setPlanFollowed] = useState<boolean>(true);
  const [fomo, setFomo] = useState<boolean>(false);
  const [revengeTrading, setRevengeTrading] = useState<boolean>(false);
  const [overtrading, setOvertrading] = useState<boolean>(false);
  const [earlyExit, setEarlyExit] = useState<boolean>(false);
  const [psychologyNotes, setPsychologyNotes] = useState<string>('');

  // Review & Learning
  const [whatWentWell, setWhatWentWell] = useState<string>('');
  const [whatWentWrong, setWhatWentWrong] = useState<string>('');
  const [learning, setLearning] = useState<string>('');
  const [nextTime, setNextTime] = useState<string>('');
  const [mistakeTags, setMistakeTags] = useState<string[]>(['Followed Plan']);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset or Populate form when opened or trade changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialTrade) {
      setTradeDate(initialTrade.trade_date || '');
      setEntryTime(initialTrade.entry_time || '');
      setExitTime(initialTrade.exit_time || '');
      setInstrument(initialTrade.instrument || 'NIFTY');
      setInstrumentType(initialTrade.instrument_type || 'NIFTY');
      setMarket(initialTrade.market || 'F&O');
      if (initialTrade.option_type === 'PE') {
        setContractType('PE');
      } else if (initialTrade.option_type === 'CE') {
        setContractType('CE');
      } else if (initialTrade.instrument_type === 'Futures') {
        setContractType('FUT');
      } else {
        setContractType('None');
      }
      setStrikePrice(initialTrade.strike_price !== null && initialTrade.strike_price !== undefined ? initialTrade.strike_price.toString() : '');
      setExpiryDate(initialTrade.expiry_date || '');
      setDirection(initialTrade.direction || 'Long');
      setQuantity(initialTrade.quantity?.toString() || '1');
      setEntryPrice(initialTrade.entry_price?.toString() || '');
      setExitPrice(initialTrade.exit_price !== null && initialTrade.exit_price !== undefined ? initialTrade.exit_price.toString() : '');
      setStopLoss(initialTrade.stop_loss ? initialTrade.stop_loss.toString() : '');
      setTarget(initialTrade.target ? initialTrade.target.toString() : '');
      setAccountCapital(initialTrade.account_capital ? initialTrade.account_capital.toString() : defaultCapital.toString());
      setRiskPercent(initialTrade.risk_percent ? initialTrade.risk_percent.toString() : '1');
      setPositionSizeMethod(initialTrade.position_size_method || 'manual');
      setBrokerage(initialTrade.brokerage?.toString() || '40');
      setCharges(initialTrade.charges?.toString() || '20');
      setMae(initialTrade.mae?.toString() || '');
      setMfe(initialTrade.mfe?.toString() || '');
      setStrategy(initialTrade.strategy || 'Breakout');
      setCustomStrategy(initialTrade.custom_strategy || '');
      setEntryReason(initialTrade.entry_reason || '');
      setMarketCondition(initialTrade.market_condition || 'Trending');
      setTimeframe(initialTrade.timeframe || '5m');
      setEntryScreenshotUrl(initialTrade.entry_screenshot_url || null);
      setExitScreenshotUrl(initialTrade.exit_screenshot_url || null);
      setBeforeEmotion(initialTrade.before_emotion || 'Confident');
      setDuringEmotion(initialTrade.during_emotion || 'Calm');
      setAfterEmotion(initialTrade.after_emotion || 'Satisfied');
      setPlanFollowed(initialTrade.plan_followed ?? true);
      setFomo(initialTrade.fomo ?? false);
      setRevengeTrading(initialTrade.revenge_trading ?? false);
      setOvertrading(initialTrade.overtrading ?? false);
      setEarlyExit(initialTrade.early_exit ?? false);
      setPsychologyNotes(initialTrade.psychology_notes || '');
      setWhatWentWell(initialTrade.what_went_well || '');
      setWhatWentWrong(initialTrade.what_went_wrong || '');
      setLearning(initialTrade.learning || '');
      setNextTime(initialTrade.next_time || '');
      setMistakeTags(initialTrade.mistake_tags || ['Followed Plan']);
    } else {
      // Defaults for new trade
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTradeDate(today);
      setEntryTime(`${hours}:${minutes}`);
      setExitTime('');
      setInstrument('NIFTY');
      setInstrumentType('NIFTY');
      setMarket('F&O');
      setContractType('PE');
      setStrikePrice('');
      setExpiryDate('');
      setDirection('Long');
      setQuantity('50');
      setEntryPrice('');
      setExitPrice('');
      setStopLoss('');
      setTarget('');
      setAccountCapital(defaultCapital.toString());
      setRiskPercent('1');
      setPositionSizeMethod('manual');
      setBrokerage('40');
      setCharges('20');
      setMae('');
      setMfe('');
      setStrategy('Breakout');
      setCustomStrategy('');
      setEntryReason('');
      setMarketCondition('Trending');
      setTimeframe('5m');
      setEntryScreenshotUrl(null);
      setExitScreenshotUrl(null);
      setBeforeEmotion('Confident');
      setDuringEmotion('Calm');
      setAfterEmotion('Satisfied');
      setPlanFollowed(true);
      setFomo(false);
      setRevengeTrading(false);
      setOvertrading(false);
      setEarlyExit(false);
      setPsychologyNotes('');
      setWhatWentWell('');
      setWhatWentWrong('');
      setLearning('');
      setNextTime('');
      setMistakeTags(['Followed Plan']);
      setOpenSections({
        basic: true,
        risk: false,
        calculations: false,
        strategy: false,
        screenshots: false,
        psychology: false,
        review: false,
      });
    }
    setErrors({});
  }, [isOpen, initialTrade, defaultCapital]);

  // Real-Time Calculations
  const calculatedFinancials = useMemo(() => {
    return calculateTradeFinancials({
      direction,
      quantity: Number(quantity) || 0,
      entry_price: Number(entryPrice) || 0,
      exit_price: exitPrice ? Number(exitPrice) : null,
      stop_loss: stopLoss ? Number(stopLoss) : null,
      target: target ? Number(target) : null,
      brokerage: Number(brokerage) || 0,
      charges: Number(charges) || 0,
      account_capital: Number(accountCapital) || defaultCapital,
      risk_percent: Number(riskPercent) || 1,
    });
  }, [direction, quantity, entryPrice, exitPrice, stopLoss, target, brokerage, charges, accountCapital, riskPercent, defaultCapital]);

  // Position sizing recommendation
  const positionSizing = useMemo(() => {
    return calculatePositionSize({
      accountCapital: Number(accountCapital) || 0,
      riskPercent: Number(riskPercent) || 0,
      entryPrice: Number(entryPrice) || 0,
      stopLoss: Number(stopLoss) || 0,
      direction,
    });
  }, [accountCapital, riskPercent, entryPrice, stopLoss, direction]);

  // Auto apply calculated position size if mode is auto
  const handleApplyCalculatedQuantity = () => {
    if (positionSizing.isValid && positionSizing.recommendedQuantity > 0) {
      setQuantity(positionSizing.recommendedQuantity.toString());
    }
  };

  const handleInstrumentSelect = (sym: string) => {
    setInstrument(sym);
    if (sym === 'NIFTY') {
      setInstrumentType('NIFTY');
      setQuantity('50');
    } else if (sym === 'BANKNIFTY') {
      setInstrumentType('BANKNIFTY');
      setQuantity('30');
    } else if (sym === 'FINNIFTY') {
      setInstrumentType('FINNIFTY');
      setQuantity('65');
    } else if (sym === 'BTCUSD' || sym === 'ETHUSD') {
      setInstrumentType('Crypto');
      setQuantity('0.5');
    } else if (sym === 'EURUSD') {
      setInstrumentType('Forex');
      setQuantity('1000');
    } else {
      setInstrumentType('Stock');
      setQuantity('100');
    }
  };

  const handleMistakeTagToggle = (tag: string) => {
    setMistakeTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Screenshot Upload Handler
  const handleScreenshotUpload = async (type: 'entry' | 'exit', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const dummyTradeId = initialTrade?.id || `temp-${Date.now()}`;
    if (type === 'entry') setUploadingEntry(true);
    else setUploadingExit(true);

    try {
      const url = await uploadScreenshot(dummyTradeId, type, file);
      if (type === 'entry') setEntryScreenshotUrl(url);
      else setExitScreenshotUrl(url);
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      if (type === 'entry') setUploadingEntry(false);
      else setUploadingExit(false);
    }
  };

  // Save Trade Execution
  const handleSubmit = async (isAnother = false) => {
    // Validate required fields
    const newErrors: { [key: string]: string } = {};
    if (!tradeDate) newErrors.tradeDate = 'Date is required';
    if (!entryTime) newErrors.entryTime = 'Entry time is required';
    if (!instrument.trim()) newErrors.instrument = 'Instrument is required';
    if (!quantity || Number(quantity) <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!entryPrice || Number(entryPrice) <= 0) newErrors.entryPrice = 'Valid entry price is required';
    if (!exitPrice || Number(exitPrice) <= 0) newErrors.exitPrice = 'Exit price is required for P&L';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setOpenSections((prev) => ({ ...prev, basic: true }));
      return;
    }

    setIsSaving(true);
    try {
      const resolvedOptionType: OptionType | null =
        contractType === 'CE' ? 'CE' : contractType === 'PE' ? 'PE' : null;

      const tradePayload: Partial<Trade> = {
        ...(initialTrade ? { id: initialTrade.id } : {}),
        trade_date: tradeDate,
        entry_time: entryTime,
        exit_time: exitTime || null,
        instrument: instrument.trim().toUpperCase(),
        instrument_type: contractType === 'FUT' ? 'Futures' : (contractType === 'CE' || contractType === 'PE') ? 'Options' : instrumentType,
        market,
        strike_price: (contractType === 'CE' || contractType === 'PE') && strikePrice ? Number(strikePrice) : null,
        option_type: resolvedOptionType,
        expiry_date: expiryDate.trim() || null,
        direction,
        quantity: Number(quantity),
        entry_price: Number(entryPrice),
        exit_price: Number(exitPrice),
        stop_loss: stopLoss ? Number(stopLoss) : null,
        target: target ? Number(target) : null,
        account_capital: Number(accountCapital) || defaultCapital,
        risk_percent: Number(riskPercent) || 1,
        position_size_method: positionSizeMethod,
        brokerage: Number(brokerage) || 0,
        charges: Number(charges) || 0,
        mae: mae ? Number(mae) : null,
        mfe: mfe ? Number(mfe) : null,
        strategy,
        custom_strategy: customStrategy.trim() || null,
        entry_reason: entryReason.trim() || null,
        market_condition: marketCondition,
        timeframe,
        entry_screenshot_url: entryScreenshotUrl,
        exit_screenshot_url: exitScreenshotUrl,
        before_emotion: beforeEmotion,
        during_emotion: duringEmotion,
        after_emotion: afterEmotion,
        plan_followed: planFollowed,
        fomo,
        revenge_trading: revengeTrading,
        overtrading,
        early_exit: earlyExit,
        psychology_notes: psychologyNotes.trim() || null,
        what_went_well: whatWentWell.trim() || null,
        what_went_wrong: whatWentWrong.trim() || null,
        learning: learning.trim() || null,
        next_time: nextTime.trim() || null,
        mistake_tags: mistakeTags,
      };

      await onSave(tradePayload, isAnother);

      if (isAnother) {
        // Clear prices for next fast entry while preserving date & instrument
        setStrikePrice('');
        setExpiryDate('');
        setEntryPrice('');
        setExitPrice('');
        setStopLoss('');
        setTarget('');
        setEntryReason('');
        setPsychologyNotes('');
        setWhatWentWell('');
        setWhatWentWrong('');
        setLearning('');
        setNextTime('');
        setEntryScreenshotUrl(null);
        setExitScreenshotUrl(null);
        setMistakeTags(['Followed Plan']);
        setErrors({});
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Error saving trade:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut listener (Cmd/Ctrl + Enter to save, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0D1322] border border-slate-700/90 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/90 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-500/20">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                {initialTrade ? 'Edit Trade' : 'Quick Log Trade'}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Fast trade entry. Required fields marked with <span className="text-rose-400 font-bold">*</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
              ⌘ + Enter to save
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-Time Floating Indicator Bar (P&L or Risk/Downside on SL) */}
        {calculatedFinancials.net_pnl !== null ? (
          <div className={`px-6 py-2.5 flex items-center justify-between text-xs font-mono border-b ${
            calculatedFinancials.net_pnl >= 0
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-4 flex-wrap">
              <span>
                Net P&L: <strong className="text-sm font-bold">{formatCurrency(calculatedFinancials.net_pnl, currency)}</strong>
                {calculatedFinancials.net_pnl_percent !== null && ` (${calculatedFinancials.net_pnl_percent}%)`}
              </span>
              <span>Gross: {formatCurrency(calculatedFinancials.gross_pnl, currency)}</span>
              <span>Charges: {formatCurrency(calculatedFinancials.totalCharges, currency)}</span>
              {calculatedFinancials.sl_loss_amount !== null && (
                <span className="text-rose-400 border-l border-slate-700/80 pl-3">
                  Loss if SL Hit: <strong className="font-bold">-{formatCurrency(calculatedFinancials.sl_loss_amount, currency)}</strong> (-{calculatedFinancials.sl_loss_points} pts)
                </span>
              )}
            </div>
            {calculatedFinancials.r_multiple !== null && (
              <span className={`px-2 py-0.5 rounded font-bold ${
                calculatedFinancials.r_multiple >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {calculatedFinancials.r_multiple > 0 ? `+${calculatedFinancials.r_multiple}R` : `${calculatedFinancials.r_multiple}R`}
              </span>
            )}
          </div>
        ) : (calculatedFinancials.sl_loss_amount !== null || calculatedFinancials.target_profit_amount !== null) ? (
          <div className="px-6 py-2.5 flex items-center justify-between text-xs font-mono border-b bg-slate-900/90 border-slate-800 text-slate-200">
            <div className="flex items-center gap-4 flex-wrap">
              {calculatedFinancials.sl_loss_amount !== null && (
                <span className="flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Loss if SL Hit:</span>
                  <strong className="text-sm font-bold text-rose-300">
                    -{formatCurrency(calculatedFinancials.sl_loss_amount, currency)}
                  </strong>
                  <span className="text-rose-400/80">(-{calculatedFinancials.sl_loss_points} pts)</span>
                  {calculatedFinancials.sl_loss_percent_capital !== null && (
                    <span className="text-[10px] text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/30">
                      {calculatedFinancials.sl_loss_percent_capital}% Cap
                    </span>
                  )}
                </span>
              )}
              {calculatedFinancials.target_profit_amount !== null && (
                <span className="flex items-center gap-1.5 text-emerald-400 border-l border-slate-700/80 pl-3">
                  <Target className="w-3.5 h-3.5 shrink-0" />
                  <span>Profit on Target:</span>
                  <strong className="text-sm font-bold text-emerald-300">
                    +{formatCurrency(calculatedFinancials.target_profit_amount, currency)}
                  </strong>
                  <span className="text-emerald-400/80">(+{calculatedFinancials.target_profit_points} pts)</span>
                </span>
              )}
            </div>
            {calculatedFinancials.planned_rr !== null && (
              <span className="px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Planned R:R 1:{calculatedFinancials.planned_rr}
              </span>
            )}
          </div>
        ) : null}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ================================================================= */}
          {/* SECTION 1: BASIC TRADE DETAILS (OPEN BY DEFAULT)                 */}
          {/* ================================================================= */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('basic')}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>BASIC TRADE DETAILS (REQUIRED)</span>
              </div>
              {openSections.basic ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.basic && (
              <div className="p-4 space-y-4">
                
                {/* Underlying Instrument Selection with Quick Picks */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Underlying Instrument <span className="text-rose-400">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                      {COMMON_INSTRUMENTS.slice(0, 7).map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => handleInstrumentSelect(sym)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            instrument === sym
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold shadow-sm shadow-blue-500/20'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-slate-200'
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="e.g. NIFTY, BANKNIFTY, FINNIFTY, RELIANCE"
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono uppercase bg-[#0B132B] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                  />
                  {errors.instrument && <p className="text-[11px] text-rose-400 mt-1">{errors.instrument}</p>}
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Date <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={tradeDate}
                      onChange={(e) => setTradeDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    {errors.tradeDate && <p className="text-[11px] text-rose-400 mt-1">{errors.tradeDate}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Entry Time <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={entryTime}
                      onChange={(e) => setEntryTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    {errors.entryTime && <p className="text-[11px] text-rose-400 mt-1">{errors.entryTime}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Exit Time
                    </label>
                    <input
                      type="time"
                      value={exitTime}
                      onChange={(e) => setExitTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* EXACT F&O / CONTRACT BLOCK (Matches user screenshot: Market, Direction | Contract, Strike, Expiry | Entry price, Exit price) */}
                <div className="p-4 rounded-2xl bg-[#090F1F] border border-slate-700/80 shadow-lg shadow-black/20 space-y-4">
                  
                  {/* Row 1: Market & Direction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-300 mb-1.5">
                        Market
                      </label>
                      <div className="relative">
                        <select
                          value={market}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMarket(val);
                            if (val === 'Equity') {
                              setContractType('None');
                              setInstrumentType('Stock');
                            } else if (val === 'F&O' && contractType === 'None') {
                              setContractType('PE');
                              setInstrumentType('Options');
                            }
                          }}
                          className="w-full appearance-none px-3.5 py-2.5 pr-10 text-sm font-medium bg-[#0B132B] border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer shadow-inner"
                        >
                          <option value="F&O">F&O</option>
                          <option value="Equity">Equity</option>
                          <option value="Commodity">Commodity</option>
                          <option value="Crypto">Crypto</option>
                          <option value="Currency">Currency</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-300 mb-1.5">
                        Direction
                      </label>
                      <div className="relative">
                        <select
                          value={direction}
                          onChange={(e) => setDirection(e.target.value as Direction)}
                          className="w-full appearance-none px-3.5 py-2.5 pr-10 text-sm font-medium bg-[#0B132B] border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer shadow-inner"
                        >
                          <option value="Long">Long</option>
                          <option value="Short">Short</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Contract, Strike, Expiry */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-300 mb-1.5">
                        Contract
                      </label>
                      <div className="relative">
                        <select
                          value={contractType}
                          onChange={(e) => {
                            const val = e.target.value;
                            setContractType(val);
                            if (val === 'CE' || val === 'PE') setInstrumentType('Options');
                            else if (val === 'FUT') setInstrumentType('Futures');
                            else if (val === 'None' && market === 'Equity') setInstrumentType('Stock');
                          }}
                          className="w-full appearance-none px-3.5 py-2.5 pr-10 text-sm font-medium bg-[#0B132B] border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer shadow-inner"
                        >
                          <option value="Put (PE)">Put (PE)</option>
                          <option value="PE">Put (PE)</option>
                          <option value="Call (CE)">Call (CE)</option>
                          <option value="CE">Call (CE)</option>
                          <option value="Futures (FUT)">Futures (FUT)</option>
                          <option value="FUT">Futures (FUT)</option>
                          <option value="None">None (Equity/Cash)</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-300 mb-1.5">
                        Strike
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder=""
                        value={strikePrice}
                        onChange={(e) => setStrikePrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#0B132B] border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-300 mb-1.5">
                        Expiry
                      </label>
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#0B132B] border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Row 3: Entry price & Exit price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-300 mb-1.5">
                        Entry price <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder=""
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#0B132B] border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
                      />
                      {errors.entryPrice && <p className="text-[11px] text-rose-400 mt-1">{errors.entryPrice}</p>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-slate-300 mb-1.5">
                        Exit price <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder=""
                        value={exitPrice}
                        onChange={(e) => setExitPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#0B132B] border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
                      />
                      {errors.exitPrice && <p className="text-[11px] text-rose-400 mt-1">{errors.exitPrice}</p>}
                    </div>
                  </div>

                  {/* Active Contract Preview */}
                  {(strikePrice || (contractType !== 'None' && contractType !== 'FUT')) && (
                    <div className="flex items-center gap-2 pt-1 text-xs border-t border-slate-800/80">
                      <span className="text-slate-400 text-[11px]">Contract Preview:</span>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#0B132B] border border-slate-700 font-mono">
                        <span className="font-extrabold text-white">{instrument || 'NIFTY'}</span>
                        {strikePrice && <span className="font-bold text-amber-300">{strikePrice}</span>}
                        {(contractType === 'CE' || contractType === 'Call (CE)') && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            CE
                          </span>
                        )}
                        {(contractType === 'PE' || contractType === 'Put (PE)') && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            PE
                          </span>
                        )}
                        {expiryDate && <span className="text-[10px] text-slate-400 font-sans">Exp: {expiryDate}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Parameters: Quantity, Stop Loss, Target */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Quantity / Lots <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="50"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    {errors.quantity && <p className="text-[11px] text-rose-400 mt-1">{errors.quantity}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>
                        Stop Loss <span className="text-slate-500 font-normal">(Optional)</span>
                      </span>
                      {calculatedFinancials.sl_loss_amount !== null && (
                        <span className="text-[11px] font-mono font-bold text-rose-400">
                          -{formatCurrency(calculatedFinancials.sl_loss_amount, currency)}
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder={direction === 'Long' && entryPrice ? `< ${entryPrice}` : direction === 'Short' && entryPrice ? `> ${entryPrice}` : ''}
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className={`w-full px-3.5 py-2 text-xs font-mono bg-slate-950 border rounded-xl text-white focus:outline-none transition-colors ${
                        calculatedFinancials.sl_loss_amount !== null
                          ? 'border-rose-500/50 focus:border-rose-400'
                          : calculatedFinancials.is_sl_valid === false
                          ? 'border-amber-500/60 focus:border-amber-400'
                          : 'border-slate-800 focus:border-blue-500'
                      }`}
                    />
                    {calculatedFinancials.sl_loss_amount !== null && (
                      <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] font-mono flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>Loss if SL Hit:</span>
                          <strong className="text-rose-200">-{formatCurrency(calculatedFinancials.sl_loss_amount, currency)}</strong>
                          <span className="text-rose-400/80">(-{calculatedFinancials.sl_loss_points} pts)</span>
                        </div>
                        {calculatedFinancials.sl_loss_percent_capital !== null && (
                          <span className="text-[10px] text-rose-300 bg-rose-900/60 px-1.5 py-0.5 rounded font-semibold">
                            {calculatedFinancials.sl_loss_percent_capital}% Cap
                          </span>
                        )}
                      </div>
                    )}
                    {stopLoss && calculatedFinancials.is_sl_valid === false && (
                      <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          {direction === 'Long'
                            ? `SL must be below entry (${entryPrice || '—'}) for Long`
                            : `SL must be above entry (${entryPrice || '—'}) for Short`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>
                        Target <span className="text-slate-500 font-normal">(Optional)</span>
                      </span>
                      {calculatedFinancials.target_profit_amount !== null && (
                        <span className="text-[11px] font-mono font-bold text-emerald-400">
                          +{formatCurrency(calculatedFinancials.target_profit_amount, currency)}
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder={direction === 'Long' && entryPrice ? `> ${entryPrice}` : direction === 'Short' && entryPrice ? `< ${entryPrice}` : ''}
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className={`w-full px-3.5 py-2 text-xs font-mono bg-slate-950 border rounded-xl text-white focus:outline-none transition-colors ${
                        calculatedFinancials.target_profit_amount !== null
                          ? 'border-emerald-500/50 focus:border-emerald-400'
                          : calculatedFinancials.is_target_valid === false
                          ? 'border-amber-500/60 focus:border-amber-400'
                          : 'border-slate-800 focus:border-blue-500'
                      }`}
                    />
                    {calculatedFinancials.target_profit_amount !== null && (
                      <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Profit on Target:</span>
                          <strong className="text-emerald-200">+{formatCurrency(calculatedFinancials.target_profit_amount, currency)}</strong>
                          <span className="text-emerald-400/80">(+{calculatedFinancials.target_profit_points} pts)</span>
                        </div>
                        {calculatedFinancials.target_profit_percent_capital !== null && (
                          <span className="text-[10px] text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded font-semibold">
                            +{calculatedFinancials.target_profit_percent_capital}% Cap
                          </span>
                        )}
                      </div>
                    )}
                    {target && calculatedFinancials.is_target_valid === false && (
                      <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          {direction === 'Long'
                            ? `Target must be above entry (${entryPrice || '—'}) for Long`
                            : `Target must be below entry (${entryPrice || '—'}) for Short`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-Time Risk & Downside vs Upside Projection Card */}
                {(calculatedFinancials.sl_loss_amount !== null || calculatedFinancials.target_profit_amount !== null) && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-cyan-400" />
                        Real-Time Risk & Downside Calculation
                      </span>
                      {calculatedFinancials.planned_rr !== null && (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300">
                          Planned R:R 1 : {calculatedFinancials.planned_rr}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Downside: Loss if SL gets hit */}
                      <div className="p-3.5 rounded-xl bg-rose-950/25 border border-rose-500/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            Loss if SL Gets Hit
                          </span>
                          {calculatedFinancials.sl_loss_percent_capital !== null && (
                            <span className="text-[10px] font-mono text-rose-300 bg-rose-900/50 px-1.5 py-0.5 rounded border border-rose-500/20 font-bold">
                              {calculatedFinancials.sl_loss_percent_capital}% Capital
                            </span>
                          )}
                        </div>
                        {calculatedFinancials.sl_loss_amount !== null ? (
                          <div>
                            <div className="text-xl font-bold font-mono text-rose-400">
                              -{formatCurrency(calculatedFinancials.sl_loss_amount, currency)}
                            </div>
                            <div className="text-[11px] font-mono text-rose-300/80 mt-1 flex items-center justify-between">
                              <span>Downside per share:</span>
                              <strong className="text-rose-200">-{calculatedFinancials.sl_loss_points} pts</strong>
                            </div>
                            <div className="text-[11px] font-mono text-rose-300/80 flex items-center justify-between">
                              <span>Total Position:</span>
                              <span className="text-white font-semibold">{quantity} units @ ₹{entryPrice || '0'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic py-2">
                            Enter Stop Loss to calculate exact loss
                          </div>
                        )}
                      </div>

                      {/* Upside: Profit if Target gets hit */}
                      <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            Profit if Target Gets Hit
                          </span>
                          {calculatedFinancials.target_profit_percent_capital !== null && (
                            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/50 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                              +{calculatedFinancials.target_profit_percent_capital}% Capital
                            </span>
                          )}
                        </div>
                        {calculatedFinancials.target_profit_amount !== null ? (
                          <div>
                            <div className="text-xl font-bold font-mono text-emerald-400">
                              +{formatCurrency(calculatedFinancials.target_profit_amount, currency)}
                            </div>
                            <div className="text-[11px] font-mono text-emerald-300/80 mt-1 flex items-center justify-between">
                              <span>Upside per share:</span>
                              <strong className="text-emerald-200">+{calculatedFinancials.target_profit_points} pts</strong>
                            </div>
                            <div className="text-[11px] font-mono text-emerald-300/80 flex items-center justify-between">
                              <span>Target Level:</span>
                              <span className="text-white font-semibold">₹{target}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic py-2">
                            Enter Target to calculate profit potential
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* SECTION 2: RISK MANAGEMENT & POSITION SIZING                     */}
          {/* ================================================================= */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('risk')}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>RISK MANAGEMENT & SIZING</span>
                {positionSizing.isValid && (
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                    Rec Qty: {positionSizing.recommendedQuantity} (Risk: {formatCurrency(positionSizing.riskAmount, currency)})
                  </span>
                )}
              </div>
              {openSections.risk ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.risk && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Account Capital
                    </label>
                    <input
                      type="number"
                      value={accountCapital}
                      onChange={(e) => setAccountCapital(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Risk Per Trade %
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={riskPercent}
                        onChange={(e) => setRiskPercent(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex gap-1">
                        {['0.5', '1', '2'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setRiskPercent(p)}
                            className="px-2 py-1 text-[11px] font-mono bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700"
                          >
                            {p}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Sizing Mode
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPositionSizeMethod('manual')}
                        className={`py-1 text-xs font-medium rounded ${
                          positionSizeMethod === 'manual'
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPositionSizeMethod('auto');
                          handleApplyCalculatedQuantity();
                        }}
                        className={`py-1 text-xs font-medium rounded ${
                          positionSizeMethod === 'auto'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        Auto Sized
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sizing Formula helper card */}
                {positionSizing.isValid ? (
                  <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="text-cyan-300 font-medium">
                        Formula: Risk Amount ({formatCurrency(positionSizing.riskAmount, currency)}) ÷ Risk Per Unit ({currency}{positionSizing.riskPerUnit})
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Recommended Quantity: <strong className="text-white font-mono">{positionSizing.recommendedQuantity} units</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCalculatedQuantity}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                    >
                      Use Recommended Qty
                    </button>
                  </div>
                ) : (
                  positionSizing.errorMessage && (
                    <div className="text-xs text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{positionSizing.errorMessage}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* SECTION 3: CHARGES, MAE & MFE                                     */}
          {/* ================================================================= */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('calculations')}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>CHARGES, BROKERAGE & EXCURSION (MAE / MFE)</span>
              </div>
              {openSections.calculations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.calculations && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Brokerage</label>
                    <input
                      type="number"
                      value={brokerage}
                      onChange={(e) => setBrokerage(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Other Charges (STT/GST)</label>
                    <input
                      type="number"
                      value={charges}
                      onChange={(e) => setCharges(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1" title="Maximum Adverse Excursion">
                      MAE (Max Adverse)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25780"
                      value={mae}
                      onChange={(e) => setMae(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1" title="Maximum Favorable Excursion">
                      MFE (Max Favorable)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25940"
                      value={mfe}
                      onChange={(e) => setMfe(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* SECTION 4: STRATEGY & SETUP                                       */}
          {/* ================================================================= */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('strategy')}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>STRATEGY & SETUP</span>
                <span className="text-slate-400 font-mono text-[11px]">({strategy})</span>
              </div>
              {openSections.strategy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.strategy && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Strategy</label>
                    <select
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      {COMMON_STRATEGIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Market Condition</label>
                    <select
                      value={marketCondition}
                      onChange={(e) => setMarketCondition(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Trending">Trending</option>
                      <option value="Sideways">Sideways</option>
                      <option value="Volatile">Volatile</option>
                      <option value="Low Volatility">Low Volatility</option>
                      <option value="Choppy">Choppy</option>
                      <option value="Range Bound">Range Bound</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Timeframe</label>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="1m">1m</option>
                      <option value="3m">3m</option>
                      <option value="5m">5m</option>
                      <option value="15m">15m</option>
                      <option value="30m">30m</option>
                      <option value="1H">1H</option>
                      <option value="4H">4H</option>
                      <option value="Daily">Daily</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {strategy === 'Other' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Custom Strategy Name</label>
                    <input
                      type="text"
                      placeholder="e.g. 9:20 Straddle Rebalance"
                      value={customStrategy}
                      onChange={(e) => setCustomStrategy(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Entry Reason
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Why did I enter this trade? (e.g. Broke out above PDH with strong volumes and sector support)"
                    value={entryReason}
                    onChange={(e) => setEntryReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* SECTION 5: CHART SCREENSHOTS (ENTRY & EXIT)                       */}
          {/* ================================================================= */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('screenshots')}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>CHART SCREENSHOTS</span>
                {(entryScreenshotUrl || exitScreenshotUrl) && (
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                    Attached
                  </span>
                )}
              </div>
              {openSections.screenshots ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.screenshots && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Entry Screenshot */}
                <div className="border border-slate-800 rounded-xl p-3 bg-slate-950">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Entry Screenshot</span>
                    {entryScreenshotUrl && (
                      <button
                        type="button"
                        onClick={() => setEntryScreenshotUrl(null)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  {entryScreenshotUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black">
                      <img src={entryScreenshotUrl} alt="Entry chart" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-lg p-6 cursor-pointer transition-colors">
                      <Upload className="w-6 h-6 text-slate-500 mb-1" />
                      <span className="text-xs text-slate-400">
                        {uploadingEntry ? 'Processing...' : 'Upload Entry Screenshot (PNG, JPG, WEBP)'}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => handleScreenshotUpload('entry', e)}
                      />
                    </label>
                  )}
                </div>

                {/* Exit Screenshot */}
                <div className="border border-slate-800 rounded-xl p-3 bg-slate-950">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Exit Screenshot</span>
                    {exitScreenshotUrl && (
                      <button
                        type="button"
                        onClick={() => setExitScreenshotUrl(null)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  {exitScreenshotUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black">
                      <img src={exitScreenshotUrl} alt="Exit chart" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-lg p-6 cursor-pointer transition-colors">
                      <Upload className="w-6 h-6 text-slate-500 mb-1" />
                      <span className="text-xs text-slate-400">
                        {uploadingExit ? 'Processing...' : 'Upload Exit Screenshot (PNG, JPG, WEBP)'}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => handleScreenshotUpload('exit', e)}
                      />
                    </label>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* SECTION 6: PSYCHOLOGY & DISCIPLINE                                */}
          {/* ================================================================= */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('psychology')}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-pink-400" />
                <span>PSYCHOLOGY & DISCIPLINE</span>
              </div>
              {openSections.psychology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.psychology && (
              <div className="p-4 space-y-4">
                
                {/* Emotions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Before Trade Emotion</label>
                    <select
                      value={beforeEmotion}
                      onChange={(e) => setBeforeEmotion(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Confident">Confident</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Fearful">Fearful</option>
                      <option value="Greedy">Greedy</option>
                      <option value="FOMO">FOMO</option>
                      <option value="Revenge">Revenge</option>
                      <option value="Excited">Excited</option>
                      <option value="Uncertain">Uncertain</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">During Trade Emotion</label>
                    <select
                      value={duringEmotion}
                      onChange={(e) => setDuringEmotion(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Calm">Calm</option>
                      <option value="Nervous">Nervous</option>
                      <option value="Fearful">Fearful</option>
                      <option value="Greedy">Greedy</option>
                      <option value="Impatient">Impatient</option>
                      <option value="Confident">Confident</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">After Trade Emotion</label>
                    <select
                      value={afterEmotion}
                      onChange={(e) => setAfterEmotion(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Satisfied">Satisfied</option>
                      <option value="Frustrated">Frustrated</option>
                      <option value="Regret">Regret</option>
                      <option value="Calm">Calm</option>
                      <option value="Excited">Excited</option>
                      <option value="Angry">Angry</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Yes / No Toggles for Psychological Traps */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                  {[
                    { label: 'Followed Plan?', val: planFollowed, set: setPlanFollowed, good: true },
                    { label: 'FOMO?', val: fomo, set: setFomo, good: false },
                    { label: 'Revenge Trade?', val: revengeTrading, set: setRevengeTrading, good: false },
                    { label: 'Overtrading?', val: overtrading, set: setOvertrading, good: false },
                    { label: 'Early Exit?', val: earlyExit, set: setEarlyExit, good: false },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[11px] font-medium text-slate-400 mb-1.5">{item.label}</div>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => item.set(true)}
                          className={`py-1 text-xs font-bold rounded transition-colors ${
                            item.val
                              ? item.good ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          YES
                        </button>
                        <button
                          type="button"
                          onClick={() => item.set(false)}
                          className={`py-1 text-xs font-bold rounded transition-colors ${
                            !item.val
                              ? item.good ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Psychology Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Mental state, self-talk, internal discipline notes..."
                    value={psychologyNotes}
                    onChange={(e) => setPsychologyNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* SECTION 7: REVIEW, LEARNING & MISTAKE TAGS                         */}
          {/* ================================================================= */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('review')}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>REVIEW & LEARNING</span>
              </div>
              {openSections.review ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openSections.review && (
              <div className="p-4 space-y-4">
                
                {/* Mistake & Execution Tags */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Execution & Mistake Tags (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_MISTAKES.map((tag) => {
                      const isSelected = mistakeTags.includes(tag);
                      const isPositive = tag === 'Followed Plan' || tag === 'Perfect Execution';
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleMistakeTagToggle(tag)}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                            isSelected
                              ? isPositive
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">What went well?</label>
                    <textarea
                      rows={2}
                      placeholder="Patience, disciplined entry, trailed stop..."
                      value={whatWentWell}
                      onChange={(e) => setWhatWentWell(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">What went wrong?</label>
                    <textarea
                      rows={2}
                      placeholder="Hesitated, widened stop, moved target too early..."
                      value={whatWentWrong}
                      onChange={(e) => setWhatWentWrong(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">What did I learn?</label>
                    <textarea
                      rows={2}
                      placeholder="Key takeaway from this price action..."
                      value={learning}
                      onChange={(e) => setLearning(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">What will I do differently next time?</label>
                    <textarea
                      rows={2}
                      placeholder="Concrete adjustment for the next session..."
                      value={nextTime}
                      onChange={(e) => setNextTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Modal Footer with Primary & Secondary Save Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {!initialTrade && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSubmit(true)}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Save & Log Another
              </button>
            )}

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit(false)}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{initialTrade ? 'Update Trade' : 'Save Trade'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
