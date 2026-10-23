// ==============================================================================
// TRADING JOURNAL - CSV & EXCEL EXPORT ENGINE
// ==============================================================================

import * as XLSX from 'xlsx';
import { Trade } from './types';

export function formatTradeForExport(trade: Trade) {
  return {
    'Trade ID': trade.id,
    'Date': trade.trade_date,
    'Entry Time': trade.entry_time,
    'Exit Time': trade.exit_time || '',
    'Instrument': trade.instrument,
    'Instrument Type': trade.instrument_type,
    'Strike Price': trade.strike_price ?? '',
    'Option Type': trade.option_type ?? '',
    'Expiry Date': trade.expiry_date ?? '',
    'Direction': trade.direction,
    'Quantity': trade.quantity,
    'Entry Price': trade.entry_price,
    'Exit Price': trade.exit_price ?? '',
    'Stop Loss': trade.stop_loss ?? '',
    'Target': trade.target ?? '',
    'Account Capital': trade.account_capital ?? '',
    'Risk %': trade.risk_percent ?? '',
    'Risk Amount': trade.risk_amount ?? '',
    'Planned RR': trade.planned_rr ?? '',
    'Actual RR': trade.actual_rr ?? '',
    'Gross P&L': trade.gross_pnl ?? '',
    'Brokerage': trade.brokerage,
    'Charges': trade.charges,
    'Net P&L': trade.net_pnl ?? '',
    'Net P&L %': trade.net_pnl_percent !== null && trade.net_pnl_percent !== undefined ? `${trade.net_pnl_percent}%` : '',
    'R Multiple': trade.r_multiple ?? '',
    'MAE': trade.mae ?? '',
    'MFE': trade.mfe ?? '',
    'Strategy': trade.strategy + (trade.custom_strategy ? ` (${trade.custom_strategy})` : ''),
    'Entry Reason': trade.entry_reason || '',
    'Market Condition': trade.market_condition || '',
    'Timeframe': trade.timeframe || '',
    'Before Emotion': trade.before_emotion || '',
    'During Emotion': trade.during_emotion || '',
    'After Emotion': trade.after_emotion || '',
    'Plan Followed': trade.plan_followed ? 'YES' : 'NO',
    'FOMO': trade.fomo ? 'YES' : 'NO',
    'Revenge Trading': trade.revenge_trading ? 'YES' : 'NO',
    'Overtrading': trade.overtrading ? 'YES' : 'NO',
    'Early Exit': trade.early_exit ? 'YES' : 'NO',
    'Psychology Notes': trade.psychology_notes || '',
    'What Went Well': trade.what_went_well || '',
    'What Went Wrong': trade.what_went_wrong || '',
    'Learning': trade.learning || '',
    'Next Time': trade.next_time || '',
    'Mistake Tags': (trade.mistake_tags || []).join(', '),
    'Entry Screenshot URL': trade.entry_screenshot_url || '',
    'Exit Screenshot URL': trade.exit_screenshot_url || '',
    'Created At': trade.created_at || '',
  };
}

export function exportToCSV(trades: Trade[], filenamePrefix = 'trading_journal') {
  if (trades.length === 0) return;

  const data = trades.map(formatTradeForExport);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(trades: Trade[], filenamePrefix = 'trading_journal') {
  if (trades.length === 0) return;

  const data = trades.map(formatTradeForExport);
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for comfortable Excel readability
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length + 2, 14),
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Trades');

  const now = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filenamePrefix}_${now}.xlsx`);
}

export function filterTradesByExportScope(trades: Trade[], scope: 'all' | 'filtered' | 'month' | 'week', filteredList?: Trade[]): Trade[] {
  if (scope === 'filtered') {
    return filteredList || trades;
  }
  if (scope === 'all') {
    return trades;
  }

  const now = new Date();
  if (scope === 'week') {
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return trades.filter((t) => new Date(t.trade_date) >= oneWeekAgo);
  }
  if (scope === 'month') {
    const currentYearMonth = now.toISOString().substring(0, 7); // YYYY-MM
    return trades.filter((t) => t.trade_date.startsWith(currentYearMonth));
  }
  return trades;
}
