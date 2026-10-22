// ==============================================================================
// TRADING JOURNAL - UNIFIED DATA ACCESS & STORAGE LAYER
// ==============================================================================

import { Trade, Profile } from './types';
import { calculateTradeFinancials } from './calculations';
import { INITIAL_SEED_TRADES } from './seedData';
import { supabase, isSupabaseConfigured } from './supabase/client';
export { isSupabaseConfigured };

const LOCAL_STORAGE_KEY = 'trading_journal_trades_v1';
const LOCAL_PROFILE_KEY = 'trading_journal_profile_v1';
const DEMO_MODE_KEY = 'trading_journal_force_demo';

export const isDemoModeActive = (): boolean => {
  if (typeof window === 'undefined') return true;
  if (!isSupabaseConfigured()) return true;
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
};

export const setDemoMode = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_MODE_KEY, enabled ? 'true' : 'false');
};

export const getStoredProfile = (): Profile => {
  if (typeof window === 'undefined') {
    return { id: 'local-profile', initial_capital: 500000, currency: '₹', name: 'Trader' };
  }
  const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  const defaultProfile: Profile = {
    id: 'local-profile',
    initial_capital: 500000,
    currency: '₹',
    name: 'Pro Trader',
  };
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
};

export const saveProfile = async (profile: Profile): Promise<Profile> => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  }
  if (!isDemoModeActive() && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('profiles').upsert({
          id: session.user.id,
          name: profile.name,
          initial_capital: profile.initial_capital,
          currency: profile.currency,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Supabase profile save error:', err);
    }
  }
  return profile;
};

export const loadTrades = async (): Promise<Trade[]> => {
  if (typeof window === 'undefined') return [];

  // If connected to Supabase and demo mode is not forced
  if (!isDemoModeActive() && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .order('trade_date', { ascending: false })
          .order('entry_time', { ascending: false });

        if (!error && data) {
          return data as Trade[];
        }
      }
    } catch (err) {
      console.warn('Falling back to local storage due to Supabase fetch error:', err);
    }
  }

  // Local Storage fallback / Demo Mode - default to empty array
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
};

export const saveTradeToStore = async (tradeInput: Partial<Trade>): Promise<Trade> => {
  // Ensure financial recalculations are 100% accurate before saving
  const fin = calculateTradeFinancials({
    direction: tradeInput.direction || 'Long',
    quantity: Number(tradeInput.quantity) || 0,
    entry_price: Number(tradeInput.entry_price) || 0,
    exit_price: tradeInput.exit_price,
    stop_loss: tradeInput.stop_loss,
    target: tradeInput.target,
    brokerage: tradeInput.brokerage,
    charges: tradeInput.charges,
    account_capital: tradeInput.account_capital,
    risk_percent: tradeInput.risk_percent,
    risk_amount: tradeInput.risk_amount,
  });

  const now = new Date().toISOString();
  const tradeId = tradeInput.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `trade-${Date.now()}`);

  const tradeToSave: Trade = {
    id: tradeId,
    user_id: tradeInput.user_id || 'user-current',
    trade_date: tradeInput.trade_date || now.split('T')[0],
    entry_time: tradeInput.entry_time || '09:15',
    exit_time: tradeInput.exit_time || null,
    instrument: (tradeInput.instrument || 'NIFTY').trim().toUpperCase(),
    instrument_type: tradeInput.instrument_type || 'NIFTY',
    direction: tradeInput.direction || 'Long',
    quantity: Number(tradeInput.quantity) || 1,
    entry_price: Number(tradeInput.entry_price) || 0,
    exit_price: tradeInput.exit_price !== undefined && tradeInput.exit_price !== null && !isNaN(Number(tradeInput.exit_price))
      ? Number(tradeInput.exit_price)
      : null,
    stop_loss: tradeInput.stop_loss ? Number(tradeInput.stop_loss) : null,
    target: tradeInput.target ? Number(tradeInput.target) : null,
    account_capital: tradeInput.account_capital ? Number(tradeInput.account_capital) : null,
    risk_percent: tradeInput.risk_percent ? Number(tradeInput.risk_percent) : null,
    risk_amount: fin.planned_risk_amount,
    planned_rr: fin.planned_rr,
    actual_rr: fin.actual_rr,
    position_size_method: tradeInput.position_size_method || 'manual',
    gross_pnl: fin.gross_pnl,
    gross_pnl_percent: fin.gross_pnl_percent,
    brokerage: fin.brokerage,
    charges: fin.charges,
    net_pnl: fin.net_pnl,
    net_pnl_percent: fin.net_pnl_percent,
    r_multiple: fin.r_multiple,
    mae: tradeInput.mae !== undefined && tradeInput.mae !== null ? Number(tradeInput.mae) : null,
    mfe: tradeInput.mfe !== undefined && tradeInput.mfe !== null ? Number(tradeInput.mfe) : null,
    strategy: tradeInput.strategy || 'Breakout',
    custom_strategy: tradeInput.custom_strategy || null,
    entry_reason: tradeInput.entry_reason || '',
    market_condition: tradeInput.market_condition || 'Trending',
    timeframe: tradeInput.timeframe || '5m',
    entry_screenshot_url: tradeInput.entry_screenshot_url || null,
    exit_screenshot_url: tradeInput.exit_screenshot_url || null,
    before_emotion: tradeInput.before_emotion || 'Confident',
    during_emotion: tradeInput.during_emotion || 'Calm',
    after_emotion: tradeInput.after_emotion || 'Satisfied',
    plan_followed: tradeInput.plan_followed ?? true,
    fomo: tradeInput.fomo ?? false,
    revenge_trading: tradeInput.revenge_trading ?? false,
    overtrading: tradeInput.overtrading ?? false,
    early_exit: tradeInput.early_exit ?? false,
    psychology_notes: tradeInput.psychology_notes || '',
    what_went_well: tradeInput.what_went_well || '',
    what_went_wrong: tradeInput.what_went_wrong || '',
    learning: tradeInput.learning || '',
    next_time: tradeInput.next_time || '',
    mistake_tags: tradeInput.mistake_tags || [],
    created_at: tradeInput.created_at || now,
    updated_at: now,
  };

  // 1. Save to Local Storage
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    let list: Trade[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    const existingIndex = list.findIndex((t) => t.id === tradeId);
    if (existingIndex >= 0) {
      list[existingIndex] = tradeToSave;
    } else {
      list.unshift(tradeToSave);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  }

  // 2. Save to Supabase if connected
  if (!isDemoModeActive() && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        tradeToSave.user_id = session.user.id;
        const { error } = await supabase.from('trades').upsert(tradeToSave);
        if (error) {
          console.error('Supabase trade upsert error:', error);
        }
      }
    } catch (err) {
      console.error('Supabase write failure:', err);
    }
  }

  return tradeToSave;
};

export const deleteTradeFromStore = async (tradeId: string): Promise<void> => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const list: Trade[] = JSON.parse(raw);
        const filtered = list.filter((t) => t.id !== tradeId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      } catch {
        // ignore
      }
    }
  }

  if (!isDemoModeActive() && supabase) {
    try {
      await supabase.from('trades').delete().eq('id', tradeId);
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }
};

export const resetStoreToSeedData = (): Trade[] => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SEED_TRADES));
  }
  return INITIAL_SEED_TRADES;
};

export const clearAllTradesFromStore = (): Trade[] => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  }
  return [];
};

/**
 * Uploads a screenshot file. Uses Supabase Storage if configured, or base64 data URL for instant client-side preview.
 */
export const uploadScreenshot = async (
  tradeId: string,
  type: 'entry' | 'exit',
  file: File
): Promise<string> => {
  // Compress client-side
  const compressedDataUrl = await compressImageToDataUrl(file);

  if (!isDemoModeActive() && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const fileExt = file.name.split('.').pop() || 'png';
        const filePath = `${session.user.id}/${tradeId}/${type}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('trade-screenshots')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('trade-screenshots')
            .getPublicUrl(filePath);
          return publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to local image URL', err);
    }
  }

  return compressedDataUrl;
};

/**
 * Client-side lightweight image compression using canvas
 */
function compressImageToDataUrl(file: File, maxWidth = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
