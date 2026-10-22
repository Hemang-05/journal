# 📈 Trading Journal — "Log. Review. Improve."

A production-quality Single Page Application (SPA) designed for active traders to rapidly log transactions (< 60 seconds), analyze performance patterns, detect cognitive and psychological leaks, and export historical logs to CSV/Excel.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Recharts**, and **Supabase (PostgreSQL, Row Level Security & Storage)**.

---

## ⚡ Key Highlights

1. **Ultra-Fast Trade Logging (< 30-60s)**:
   - Quick log modal with keyboard shortcuts (`N` to open, `⌘ + Enter` to save).
   - Collapsible sections: Basic Details (open by default), Risk Management, Setup & Strategy, Psychology, Review & Learnings.
   - Required vs. Optional separation: Only Date, Entry Time, Instrument, Direction, Qty, Entry Price, and Exit Price are required.

2. **Accurate Financial Calculations**:
   - Gross P&L, Net P&L (accounting for brokerage, exchange charges, STT/GST).
   - Real-time Planned Risk, Actual Reward, Planned R:R, and Prominent **Actual R-Multiple** (`+2.0R`, `-1.0R`).
   - Position Sizing Engine: Automatic position size calculation based on `(Capital × Risk %) ÷ |Entry - SL|` with one-click quantity application.
   - Statistical Expectancy (`+₹425/trade`) and Maximum Drawdown analysis.

3. **Psychology & Cognitive Leakage Analysis**:
   - Before, During, and After emotion tracking.
   - Binary discipline toggles: *Followed Plan*, *FOMO*, *Revenge Trading*, *Overtrading*, *Early Exit*.
   - Direct performance comparison between disciplined plan-following trades and rule violations.
   - Mistake cost analysis detailing the exact monetary impact of each mistake tag.

4. **Deep Analytics & Visualizations (Recharts)**:
   - **Equity Curve**: Cumulative net growth with drawdown tracking.
   - **Daily P&L**: Green/Red bar chart for session profitability.
   - **Outcome Donut**: Wins, Losses, and Break-Even distribution.
   - **Strategy Matrix**: Expectancy, win rate, average R, and profit factor per setup.
   - **Time-of-Day Analysis**: 6 discrete intraday session windows.
   - **Day-of-Week Analysis**: Monday through Friday performance.

5. **Automated Retrospectives**:
   - **Weekly Review**: Summary cards + rule-based actionable insights generated directly from real trade data.
   - **Monthly Review**: Monthly equity curve, discipline breakdown, and performance deep dive.

6. **Full-Spectrum Export (42 Columns)**:
   - Export all fields to **CSV** or **Microsoft Excel (.xlsx)**.
   - Selectable scopes: All Trades, Current Filtered View, Current Month, or Current Week.

7. **Zero-Setup Local Demo Mode + Live Supabase Integration**:
   - Runs out of the box with realistic sample seed trades (NIFTY, BANKNIFTY, RELIANCE, TCS, BTCUSD) stored in browser storage.
   - Connect live Supabase PostgreSQL and Storage anytime via environment variables.

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000/journal](http://localhost:3000/journal) in your browser. (The root `/` automatically redirects to `/journal`).

---

## 🗄️ Supabase Database & Storage Setup (Optional)

The application includes complete PostgreSQL DDL and Row Level Security scripts in the `supabase/` folder:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the contents of [`supabase/schema.sql`](file:///Users/hemangmehta/Documents/Projects/Journal/supabase/schema.sql).
   - Creates `profiles` and `trades` tables.
   - Configures optimized composite indexes (`idx_trades_user_date`, `idx_trades_user_instrument`, etc.).
   - Enables Row Level Security (RLS) ensuring users only ever query their own trades.
   - Sets up the `trade-screenshots` storage bucket and security policies.
3. Copy your project credentials into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart the development server (`npm run dev`). The header badge will immediately switch to `Live DB`.

---

## 📁 Project Architecture

```
├── supabase/
│   ├── schema.sql                 # PostgreSQL tables, RLS policies, indexes, storage buckets
│   └── seed.sql                   # Sample SQL seed data
├── src/
│   ├── app/
│   │   ├── globals.css            # Dark trading terminal styling, custom scrollbars
│   │   ├── layout.tsx             # Root dark layout
│   │   ├── page.tsx               # Redirect to /journal
│   │   └── journal/
│   │       └── page.tsx           # Main Single Page Application (SPA) dashboard
│   ├── components/journal/
│   │   ├── Header.tsx             # Brand header, date, export, settings, CTA
│   │   ├── QuickStats.tsx         # Real-time KPI cards with timeframe switcher
│   │   ├── TradeTable.tsx         # Compact, high-density trade table
│   │   ├── TradeFormModal.tsx     # Fast trade logging & edit modal with live P&L
│   │   ├── TradeDetailModal.tsx   # Detailed trade review, screenshots & psychology
│   │   ├── TradeFilters.tsx       # Instant search and multi-parameter filters
│   │   ├── AnalyticsDashboard.tsx # Recharts charts: equity, daily P&L, strategies, time
│   │   ├── WeeklyReview.tsx       # Automated weekly retrospective & rule-based focus
│   │   ├── MonthlyReview.tsx      # Monthly deep dive and equity curve
│   │   ├── ExportModal.tsx        # CSV and Excel (.xlsx) export modal
│   │   └── SettingsModal.tsx      # Capital, currency, Supabase status & seed data controls
│   └── lib/
│       ├── types.ts               # Complete TypeScript data contracts
│       ├── calculations.ts        # Accurate financial engine & statistical metrics
│       ├── seedData.ts            # Realistic sample trade records
│       ├── storage.ts             # Unified storage (Supabase + LocalStorage fallback)
│       ├── exportUtils.ts         # CSV & XLSX generator
│       └── supabase/
│           └── client.ts          # Browser Supabase client wrapper
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `N` | Open Quick Log Trade form |
| `⌘ + Enter` / `Ctrl + Enter` | Save trade |
| `Esc` | Close any open modal or drawer |
