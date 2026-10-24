// ==============================================================================
// TRADING JOURNAL - ACCURATE FINANCIAL CALCULATIONS ENGINE
// ==============================================================================

import {
  Trade,
  PerformanceStats,
  EquityPoint,
  DailyPnlPoint,
  StrategyPerformanceItem,
  TimeSlotPerformanceItem,
  DayOfWeekPerformanceItem,
  PsychologyComparisonItem,
  MistakeAnalysisItem,
} from './types';

/**
 * Calculates Gross P&L, Net P&L, Charges, and R-Multiple for a single trade.
 */
export function calculateTradeFinancials(trade: {
  direction: 'Long' | 'Short';
  quantity: number;
  entry_price: number;
  exit_price?: number | null;
  stop_loss?: number | null;
  target?: number | null;
  brokerage?: number;
  charges?: number;
  account_capital?: number | null;
  risk_percent?: number | null;
  risk_amount?: number | null;
}) {
  const qty = Number(trade.quantity) || 0;
  const entry = Number(trade.entry_price) || 0;
  const exit = trade.exit_price !== undefined && trade.exit_price !== null && !isNaN(Number(trade.exit_price))
    ? Number(trade.exit_price)
    : null;
  const sl = trade.stop_loss ? Number(trade.stop_loss) : null;
  const target = trade.target ? Number(trade.target) : null;
  const brokerage = Number(trade.brokerage) || 0;
  const charges = Number(trade.charges) || 0;
  const totalCharges = roundTo2(brokerage + charges);

  let gross_pnl: number | null = null;
  let gross_pnl_percent: number | null = null;
  let net_pnl: number | null = null;
  let net_pnl_percent: number | null = null;
  let planned_rr: number | null = null;
  let actual_rr: number | null = null;
  let r_multiple: number | null = null;
  let planned_risk_amount = trade.risk_amount ? Number(trade.risk_amount) : null;
  let sl_loss_amount: number | null = null;
  let sl_loss_points: number | null = null;
  let sl_loss_percent_capital: number | null = null;
  let is_sl_valid: boolean | null = null;

  let target_profit_amount: number | null = null;
  let target_profit_points: number | null = null;
  let target_profit_percent_capital: number | null = null;
  let is_target_valid: boolean | null = null;

  let points_captured: number | null = null;
  const capital = trade.account_capital ? Number(trade.account_capital) : null;

  // Calculate Planned Risk / Loss on Stop Loss if available
  if (sl !== null && entry > 0 && qty > 0) {
    const rawRiskDiff = trade.direction === 'Long' ? (entry - sl) : (sl - entry);
    if (rawRiskDiff > 0) {
      is_sl_valid = true;
      sl_loss_points = roundTo2(rawRiskDiff);
      sl_loss_amount = roundTo2(rawRiskDiff * qty);
      planned_risk_amount = sl_loss_amount;
      if (capital && capital > 0) {
        sl_loss_percent_capital = roundTo2((sl_loss_amount / capital) * 100);
      }
    } else {
      is_sl_valid = false;
      sl_loss_points = roundTo2(rawRiskDiff);
    }
  }

  // Calculate Planned Target Profit & R:R if target & SL are present
  if (target !== null && entry > 0 && qty > 0) {
    const rawRewardDiff = trade.direction === 'Long' ? (target - entry) : (entry - target);
    if (rawRewardDiff > 0) {
      is_target_valid = true;
      target_profit_points = roundTo2(rawRewardDiff);
      target_profit_amount = roundTo2(rawRewardDiff * qty);
      if (capital && capital > 0) {
        target_profit_percent_capital = roundTo2((target_profit_amount / capital) * 100);
      }
    } else {
      is_target_valid = false;
      target_profit_points = roundTo2(rawRewardDiff);
    }
  }

  if (sl !== null && target !== null && entry > 0) {
    const riskPerUnit = trade.direction === 'Long' ? (entry - sl) : (sl - entry);
    const rewardPerUnit = trade.direction === 'Long' ? (target - entry) : (entry - target);
    if (riskPerUnit > 0 && rewardPerUnit > 0) {
      planned_rr = roundTo2(rewardPerUnit / riskPerUnit);
    }
  }

  // Calculate Gross & Net P&L if exit price is set
  if (exit !== null && entry > 0 && qty > 0) {
    if (trade.direction === 'Long') {
      points_captured = roundTo2(exit - entry);
      gross_pnl = roundTo2((exit - entry) * qty);
    } else {
      points_captured = roundTo2(entry - exit);
      gross_pnl = roundTo2((entry - exit) * qty);
    }

    const tradeValue = entry * qty;
    gross_pnl_percent = tradeValue > 0 ? roundTo2((gross_pnl / tradeValue) * 100) : 0;
    net_pnl = roundTo2(gross_pnl - totalCharges);
    net_pnl_percent = tradeValue > 0 ? roundTo2((net_pnl / tradeValue) * 100) : 0;

    // Actual R Multiple: Net P&L / Planned Risk Amount
    if (planned_risk_amount && planned_risk_amount > 0 && net_pnl !== null) {
      r_multiple = roundTo2(net_pnl / planned_risk_amount);
      actual_rr = r_multiple;
    }
  }

  return {
    gross_pnl,
    gross_pnl_percent,
    brokerage,
    charges,
    totalCharges,
    net_pnl,
    net_pnl_percent,
    points_captured,
    planned_risk_amount,
    sl_loss_amount,
    sl_loss_points,
    sl_loss_percent_capital,
    is_sl_valid,
    target_profit_amount,
    target_profit_points,
    target_profit_percent_capital,
    is_target_valid,
    planned_rr,
    actual_rr,
    r_multiple,
  };
}

/**
 * Calculates recommended position size based on capital, risk %, and stop loss distance.
 */
export function calculatePositionSize(params: {
  accountCapital: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
  direction: 'Long' | 'Short';
}): {
  riskAmount: number;
  riskPerUnit: number;
  recommendedQuantity: number;
  isValid: boolean;
  errorMessage?: string;
} {
  const { accountCapital, riskPercent, entryPrice, stopLoss, direction } = params;

  if (accountCapital <= 0) {
    return { riskAmount: 0, riskPerUnit: 0, recommendedQuantity: 0, isValid: false, errorMessage: 'Account capital must be > 0' };
  }
  if (riskPercent <= 0) {
    return { riskAmount: 0, riskPerUnit: 0, recommendedQuantity: 0, isValid: false, errorMessage: 'Risk % must be > 0' };
  }
  if (entryPrice <= 0 || stopLoss <= 0) {
    return { riskAmount: 0, riskPerUnit: 0, recommendedQuantity: 0, isValid: false, errorMessage: 'Entry price and stop loss required' };
  }

  const riskAmount = roundTo2(accountCapital * (riskPercent / 100));
  const riskPerUnit = direction === 'Long' ? (entryPrice - stopLoss) : (stopLoss - entryPrice);

  if (riskPerUnit <= 0) {
    return {
      riskAmount,
      riskPerUnit,
      recommendedQuantity: 0,
      isValid: false,
      errorMessage: direction === 'Long' ? 'Stop loss must be below entry price for Long' : 'Stop loss must be above entry price for Short',
    };
  }

  const recommendedQuantity = Math.floor(riskAmount / riskPerUnit);

  return {
    riskAmount,
    riskPerUnit: roundTo2(riskPerUnit),
    recommendedQuantity: Math.max(1, recommendedQuantity),
    isValid: true,
  };
}

/**
 * Calculates comprehensive trading performance statistics.
 */
export function calculatePerformanceStats(trades: Trade[], initialCapital = 100000): PerformanceStats {
  const completedTrades = trades.filter((t) => t.net_pnl !== null && t.net_pnl !== undefined);

  if (completedTrades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      winRate: 0,
      lossRate: 0,
      grossProfit: 0,
      grossLoss: 0,
      totalCharges: 0,
      netPnl: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      averageR: 0,
      expectancy: 0,
      peakEquity: initialCapital,
      currentEquity: initialCapital,
      currentDrawdown: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      planAdherenceRate: 0,
      bestStrategy: 'N/A',
      worstStrategy: 'N/A',
      bestTimeSlot: 'N/A',
      worstTimeSlot: 'N/A',
      bestDayOfWeek: 'N/A',
      worstDayOfWeek: 'N/A',
    };
  }

  let totalGrossProfit = 0;
  let totalGrossLoss = 0;
  let totalCharges = 0;
  let totalNetPnl = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let breakEvenTrades = 0;
  let largestWin = 0;
  let largestLoss = 0;
  let rSum = 0;
  let rCount = 0;
  let planFollowedCount = 0;

  for (const t of completedTrades) {
    const net = Number(t.net_pnl) || 0;
    const charges = (Number(t.brokerage) || 0) + (Number(t.charges) || 0);
    totalCharges += charges;
    totalNetPnl += net;

    if (t.plan_followed) {
      planFollowedCount++;
    }

    if (t.r_multiple !== null && t.r_multiple !== undefined) {
      rSum += Number(t.r_multiple);
      rCount++;
    }

    if (net > 0) {
      winningTrades++;
      totalGrossProfit += net;
      if (net > largestWin) largestWin = net;
    } else if (net < 0) {
      losingTrades++;
      totalGrossLoss += Math.abs(net);
      if (net < largestLoss) largestLoss = net;
    } else {
      breakEvenTrades++;
    }
  }

  const totalTrades = completedTrades.length;
  const winRate = roundTo2((winningTrades / totalTrades) * 100);
  const lossRate = roundTo2((losingTrades / totalTrades) * 100);
  const profitFactor = totalGrossLoss > 0 ? roundTo2(totalGrossProfit / totalGrossLoss) : totalGrossProfit > 0 ? 999 : 0;
  const averageWin = winningTrades > 0 ? roundTo2(totalGrossProfit / winningTrades) : 0;
  const averageLoss = losingTrades > 0 ? roundTo2(totalGrossLoss / losingTrades) : 0;
  const averageR = rCount > 0 ? roundTo2(rSum / rCount) : 0;

  // Expectancy = (Win% * Avg Win) - (Loss% * Avg Loss)
  const pWin = winningTrades / totalTrades;
  const pLoss = losingTrades / totalTrades;
  const expectancy = roundTo2((pWin * averageWin) - (pLoss * averageLoss));

  const planAdherenceRate = roundTo2((planFollowedCount / totalTrades) * 100);

  // Chronological Drawdown and Equity Curve
  const sorted = [...completedTrades].sort((a, b) => {
    const dateCompare = a.trade_date.localeCompare(b.trade_date);
    if (dateCompare !== 0) return dateCompare;
    return (a.entry_time || '').localeCompare(b.entry_time || '');
  });

  let runningEquity = initialCapital;
  let peakEquity = initialCapital;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;

  for (const t of sorted) {
    runningEquity += Number(t.net_pnl) || 0;
    if (runningEquity > peakEquity) {
      peakEquity = runningEquity;
    }
    const dd = peakEquity - runningEquity;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      if (peakEquity > 0) {
        maxDrawdownPercent = roundTo2((dd / peakEquity) * 100);
      }
    }
  }

  const currentEquity = runningEquity;
  const currentDrawdown = Math.max(0, peakEquity - currentEquity);

  // Best/Worst Strategy
  const stratStats = calculateStrategyPerformance(completedTrades);
  const bestStrat = stratStats.length > 0 ? stratStats[0].strategy : 'N/A';
  const worstStrat = stratStats.length > 0 ? stratStats[stratStats.length - 1].strategy : 'N/A';

  // Best/Worst Time Slot
  const timeStats = calculateTimeSlotPerformance(completedTrades);
  const sortedTime = [...timeStats].sort((a, b) => b.netPnl - a.netPnl);
  const bestTime = sortedTime.length > 0 && sortedTime[0].trades > 0 ? sortedTime[0].slot : 'N/A';
  const worstTime = sortedTime.length > 0 && sortedTime[sortedTime.length - 1].trades > 0 ? sortedTime[sortedTime.length - 1].slot : 'N/A';

  // Best/Worst Day of Week
  const dayStats = calculateDayOfWeekPerformance(completedTrades);
  const sortedDay = [...dayStats].sort((a, b) => b.netPnl - a.netPnl);
  const bestDay = sortedDay.length > 0 && sortedDay[0].trades > 0 ? sortedDay[0].day : 'N/A';
  const worstDay = sortedDay.length > 0 && sortedDay[sortedDay.length - 1].trades > 0 ? sortedDay[sortedDay.length - 1].day : 'N/A';

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    breakEvenTrades,
    winRate,
    lossRate,
    grossProfit: roundTo2(totalGrossProfit),
    grossLoss: roundTo2(totalGrossLoss),
    totalCharges: roundTo2(totalCharges),
    netPnl: roundTo2(totalNetPnl),
    profitFactor,
    averageWin,
    averageLoss,
    largestWin: roundTo2(largestWin),
    largestLoss: roundTo2(largestLoss),
    averageR,
    expectancy,
    peakEquity: roundTo2(peakEquity),
    currentEquity: roundTo2(currentEquity),
    currentDrawdown: roundTo2(currentDrawdown),
    maxDrawdown: roundTo2(maxDrawdown),
    maxDrawdownPercent,
    planAdherenceRate,
    bestStrategy: bestStrat,
    worstStrategy: worstStrat,
    bestTimeSlot: bestTime,
    worstTimeSlot: worstTime,
    bestDayOfWeek: bestDay,
    worstDayOfWeek: worstDay,
  };
}

/**
 * Builds chronological equity curve data points for Recharts.
 */
export function buildEquityCurve(trades: Trade[], initialCapital = 100000): EquityPoint[] {
  const completedTrades = trades
    .filter((t) => t.net_pnl !== null && t.net_pnl !== undefined)
    .sort((a, b) => {
      const d = a.trade_date.localeCompare(b.trade_date);
      if (d !== 0) return d;
      return (a.entry_time || '').localeCompare(b.entry_time || '');
    });

  let cumulativePnl = 0;
  let runningPeak = 0;
  const points: EquityPoint[] = [
    {
      date: completedTrades[0]?.trade_date || 'Start',
      tradeNumber: 0,
      pnl: 0,
      cumulativeNetPnl: 0,
      peak: 0,
      drawdown: 0,
      instrument: 'Baseline',
    },
  ];

  completedTrades.forEach((trade, index) => {
    const pnl = Number(trade.net_pnl) || 0;
    cumulativePnl += pnl;
    if (cumulativePnl > runningPeak) {
      runningPeak = cumulativePnl;
    }
    const dd = runningPeak - cumulativePnl;

    points.push({
      date: trade.trade_date,
      tradeNumber: index + 1,
      pnl: roundTo2(pnl),
      cumulativeNetPnl: roundTo2(cumulativePnl),
      peak: roundTo2(runningPeak),
      drawdown: roundTo2(dd),
      instrument: trade.instrument,
    });
  });

  return points;
}

/**
 * Aggregates daily P&L for Bar Chart.
 */
export function buildDailyPnl(trades: Trade[]): DailyPnlPoint[] {
  const map = new Map<string, { pnl: number; tradesCount: number; wins: number }>();

  for (const t of trades) {
    if (t.net_pnl === null || t.net_pnl === undefined) continue;
    const date = t.trade_date;
    const current = map.get(date) || { pnl: 0, tradesCount: 0, wins: 0 };
    const pnl = Number(t.net_pnl) || 0;

    current.pnl += pnl;
    current.tradesCount += 1;
    if (pnl > 0) current.wins += 1;
    map.set(date, current);
  }

  const sortedDates = Array.from(map.keys()).sort();
  return sortedDates.map((date) => {
    const data = map.get(date)!;
    return {
      date,
      pnl: roundTo2(data.pnl),
      tradesCount: data.tradesCount,
      winRate: roundTo2((data.wins / data.tradesCount) * 100),
    };
  });
}

/**
 * Performance grouped by Strategy.
 */
export function calculateStrategyPerformance(trades: Trade[]): StrategyPerformanceItem[] {
  const map = new Map<string, { trades: number; wins: number; netPnl: number; grossProfit: number; grossLoss: number; rSum: number; rCount: number }>();

  for (const t of trades) {
    if (t.net_pnl === null || t.net_pnl === undefined) continue;
    const strategy = t.strategy || 'Unclassified';
    const current = map.get(strategy) || { trades: 0, wins: 0, netPnl: 0, grossProfit: 0, grossLoss: 0, rSum: 0, rCount: 0 };
    const pnl = Number(t.net_pnl) || 0;

    current.trades += 1;
    current.netPnl += pnl;
    if (pnl > 0) {
      current.wins += 1;
      current.grossProfit += pnl;
    } else if (pnl < 0) {
      current.grossLoss += Math.abs(pnl);
    }
    if (t.r_multiple !== null && t.r_multiple !== undefined) {
      current.rSum += Number(t.r_multiple);
      current.rCount += 1;
    }
    map.set(strategy, current);
  }

  const result: StrategyPerformanceItem[] = [];
  for (const [strategy, d] of map.entries()) {
    result.push({
      strategy,
      trades: d.trades,
      winRate: roundTo2((d.wins / d.trades) * 100),
      netPnl: roundTo2(d.netPnl),
      averagePnl: roundTo2(d.netPnl / d.trades),
      averageR: d.rCount > 0 ? roundTo2(d.rSum / d.rCount) : 0,
      profitFactor: d.grossLoss > 0 ? roundTo2(d.grossProfit / d.grossLoss) : d.grossProfit > 0 ? 999 : 0,
    });
  }

  return result.sort((a, b) => b.netPnl - a.netPnl);
}

/**
 * Performance grouped by Time Slot of day.
 * Slots:
 * 9:15–10:00
 * 10:00–11:00
 * 11:00–12:00
 * 12:00–13:00
 * 13:00–14:00
 * 14:00–15:30
 */
export function calculateTimeSlotPerformance(trades: Trade[]): TimeSlotPerformanceItem[] {
  const slots = [
    { slot: '09:15–10:00', start: '09:15', end: '10:00' },
    { slot: '10:00–11:00', start: '10:00', end: '11:00' },
    { slot: '11:00–12:00', start: '11:00', end: '12:00' },
    { slot: '12:00–13:00', start: '12:00', end: '13:00' },
    { slot: '13:00–14:00', start: '13:00', end: '14:00' },
    { slot: '14:00–15:30', start: '14:00', end: '15:30' },
  ];

  const map = new Map<string, { trades: number; wins: number; netPnl: number; rSum: number; rCount: number }>();
  for (const s of slots) {
    map.set(s.slot, { trades: 0, wins: 0, netPnl: 0, rSum: 0, rCount: 0 });
  }

  for (const t of trades) {
    if (t.net_pnl === null || t.net_pnl === undefined) continue;
    const timeStr = (t.entry_time || '').substring(0, 5); // HH:mm
    if (!timeStr) continue;

    let targetSlot = '14:00–15:30';
    for (const s of slots) {
      if (timeStr >= s.start && timeStr < s.end) {
        targetSlot = s.slot;
        break;
      }
    }

    const current = map.get(targetSlot)!;
    const pnl = Number(t.net_pnl) || 0;
    current.trades += 1;
    current.netPnl += pnl;
    if (pnl > 0) current.wins += 1;
    if (t.r_multiple !== null && t.r_multiple !== undefined) {
      current.rSum += Number(t.r_multiple);
      current.rCount += 1;
    }
  }

  return slots.map((s) => {
    const d = map.get(s.slot)!;
    return {
      slot: s.slot,
      trades: d.trades,
      winRate: d.trades > 0 ? roundTo2((d.wins / d.trades) * 100) : 0,
      netPnl: roundTo2(d.netPnl),
      averageR: d.rCount > 0 ? roundTo2(d.rSum / d.rCount) : 0,
    };
  });
}

/**
 * Performance grouped by Day of Week (Monday to Friday).
 */
export function calculateDayOfWeekPerformance(trades: Trade[]): DayOfWeekPerformanceItem[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const map = new Map<string, { trades: number; wins: number; netPnl: number }>();
  for (const d of days) {
    map.set(d, { trades: 0, wins: 0, netPnl: 0 });
  }

  for (const t of trades) {
    if (t.net_pnl === null || t.net_pnl === undefined) continue;
    const date = new Date(t.trade_date);
    if (isNaN(date.getTime())) continue;

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!map.has(dayName)) continue;

    const current = map.get(dayName)!;
    const pnl = Number(t.net_pnl) || 0;
    current.trades += 1;
    current.netPnl += pnl;
    if (pnl > 0) current.wins += 1;
  }

  return days.map((day) => {
    const d = map.get(day)!;
    return {
      day,
      trades: d.trades,
      winRate: d.trades > 0 ? roundTo2((d.wins / d.trades) * 100) : 0,
      netPnl: roundTo2(d.netPnl),
    };
  });
}

/**
 * Psychology performance comparison (Plan followed vs violated, FOMO, Revenge, Overtrading).
 */
export function calculatePsychologyPerformance(trades: Trade[]): PsychologyComparisonItem[] {
  const categories = [
    { key: 'plan_followed', label: 'Plan Followed', filter: (t: Trade) => t.plan_followed },
    { key: 'plan_violated', label: 'Plan Violated', filter: (t: Trade) => !t.plan_followed },
    { key: 'fomo', label: 'FOMO Trades', filter: (t: Trade) => t.fomo },
    { key: 'revenge', label: 'Revenge Trades', filter: (t: Trade) => t.revenge_trading },
    { key: 'overtrading', label: 'Overtrading', filter: (t: Trade) => t.overtrading },
    { key: 'early_exit', label: 'Early Exits', filter: (t: Trade) => t.early_exit },
  ];

  return categories.map((cat) => {
    const subset = trades.filter((t) => t.net_pnl !== null && t.net_pnl !== undefined && cat.filter(t));
    const tradesCount = subset.length;
    const wins = subset.filter((t) => Number(t.net_pnl) > 0).length;
    const netPnl = subset.reduce((acc, t) => acc + (Number(t.net_pnl) || 0), 0);

    return {
      category: cat.label,
      trades: tradesCount,
      winRate: tradesCount > 0 ? roundTo2((wins / tradesCount) * 100) : 0,
      netPnl: roundTo2(netPnl),
      avgPnl: tradesCount > 0 ? roundTo2(netPnl / tradesCount) : 0,
    };
  });
}

/**
 * Mistake frequency and financial P&L impact analysis.
 */
export function calculateMistakeAnalysis(trades: Trade[]): MistakeAnalysisItem[] {
  const map = new Map<string, { count: number; netPnlImpact: number }>();

  for (const t of trades) {
    if (t.net_pnl === null || t.net_pnl === undefined) continue;
    const pnl = Number(t.net_pnl) || 0;
    const tags = t.mistake_tags || [];

    for (const tag of tags) {
      if (tag === 'Followed Plan' || tag === 'Perfect Execution') continue;
      const current = map.get(tag) || { count: 0, netPnlImpact: 0 };
      current.count += 1;
      current.netPnlImpact += pnl;
      map.set(tag, current);
    }
  }

  const result: MistakeAnalysisItem[] = [];
  for (const [tag, d] of map.entries()) {
    result.push({
      tag,
      count: d.count,
      netPnlImpact: roundTo2(d.netPnlImpact),
    });
  }

  // Sort by negative financial impact (largest losses first)
  return result.sort((a, b) => a.netPnlImpact - b.netPnlImpact);
}

/**
 * Generates rule-based dynamic weekly recommendations based on actual trade metrics.
 */
export function generateWeeklyActionableInsights(trades: Trade[], stats: PerformanceStats): string[] {
  const insights: string[] = [];

  if (trades.length === 0) {
    return ['No trades recorded for this period. Log trades to view actionable insights.'];
  }

  // 1. Plan Adherence
  if (stats.planAdherenceRate < 70) {
    insights.push(`Plan adherence was low at ${stats.planAdherenceRate}%. Plan violations are dragging down overall profitability.`);
  } else if (stats.planAdherenceRate >= 85) {
    insights.push(`Great discipline: You followed your trading plan on ${stats.planAdherenceRate}% of trades.`);
  }

  // 2. Psychology Impact (FOMO, Revenge)
  const fomoTrades = trades.filter((t) => t.fomo && t.net_pnl !== null);
  if (fomoTrades.length > 0) {
    const fomoLoss = fomoTrades.reduce((acc, t) => acc + (Number(t.net_pnl) || 0), 0);
    insights.push(`FOMO was recorded on ${fomoTrades.length} trades with a combined impact of ₹${Math.abs(fomoLoss).toLocaleString('en-IN')}. Wait for confirmed pullbacks.`);
  }

  const revengeTrades = trades.filter((t) => t.revenge_trading && t.net_pnl !== null);
  if (revengeTrades.length > 0) {
    const revengeLoss = revengeTrades.reduce((acc, t) => acc + (Number(t.net_pnl) || 0), 0);
    insights.push(`Revenge trading triggered ${revengeTrades.length} trades (${revengeLoss < 0 ? '-' : '+'}₹${Math.abs(revengeLoss).toLocaleString('en-IN')}). Implement a mandatory 30-minute cooldown after 2 consecutive stop-outs.`);
  }

  // 3. Strategy Insights
  if (stats.bestStrategy && stats.bestStrategy !== 'N/A') {
    insights.push(`Top performing setup: "${stats.bestStrategy}". Continue sizing appropriately into this edge.`);
  }
  if (stats.worstStrategy && stats.worstStrategy !== 'N/A' && stats.worstStrategy !== stats.bestStrategy) {
    insights.push(`Underperforming setup: "${stats.worstStrategy}". Consider pausing or tightening criteria on this setup.`);
  }

  // 4. Time of Day
  if (stats.bestTimeSlot && stats.bestTimeSlot !== 'N/A') {
    insights.push(`Prime trading window: ${stats.bestTimeSlot}. You generated the highest net return during this session.`);
  }

  // 5. R Multiple & Expectancy
  if (stats.averageR > 0) {
    insights.push(`Positive Average R of +${stats.averageR}R and Expectancy of ₹${stats.expectancy.toLocaleString('en-IN')}/trade demonstrates statistical edge.`);
  } else if (stats.averageR < 0) {
    insights.push(`Negative Average R (${stats.averageR}R). Protect capital by letting winning trades run to 1:2 R:R and cutting losers swiftly at initial stop.`);
  }

  return insights.slice(0, 5);
}

/**
 * Formats a currency amount with ₹ (or specified symbol) and Indian or International comma format.
 */
export function formatCurrency(amount: number | null | undefined, currency = '₹'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${currency}${formatted}`;
}

export function roundTo2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
