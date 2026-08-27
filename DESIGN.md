<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AlphaTrack Index Monitor — Design Reference</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "on-primary": "#003824",
          "surface-dim": "#0f131d",
          "secondary": "#ffb95f",
          "outline": "#86948a",
          "surface-bright": "#353944",
          "surface": "#0f131d",
          "tertiary": "#ffb2b7",
          "surface-container-highest": "#313540",
          "error": "#ffb4ab",
          "inverse-on-surface": "#2c303b",
          "on-background": "#dfe2f1",
          "surface-variant": "#313540",
          "on-surface": "#dfe2f1",
          "primary-fixed": "#6ffbbe",
          "inverse-primary": "#006c49",
          "primary-container": "#10b981",
          "inverse-surface": "#dfe2f1",
          "error-container": "#93000a",
          "secondary-fixed-dim": "#ffb95f",
          "surface-tint": "#4edea3",
          "surface-container": "#1c1f2a",
          "surface-container-low": "#171b26",
          "background": "#0f131d",
          "secondary-container": "#ee9800",
          "on-surface-variant": "#bbcabf",
          "outline-variant": "#3c4a42",
          "surface-container-high": "#262a35",
          "on-secondary": "#472a00",
          "on-error": "#690005",
          "surface-container-lowest": "#0a0e18",
          "primary": "#4edea3"
        },
        borderRadius: {
          DEFAULT: "0.125rem",
          lg: "0.25rem",
          xl: "0.5rem",
          full: "0.75rem"
        },
        fontFamily: {
          headline: ["Geist", "system-ui", "sans-serif"],
          mono: ["JetBrains Mono", "monospace"]
        },
        fontSize: {
          "display": ["30px", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
          "headline": ["20px", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "600" }],
          "data-lg": ["18px", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "600" }],
          "data-md": ["14px", { lineHeight: "1", letterSpacing: "-0.01em", fontWeight: "500" }],
          "data-sm": ["12px", { lineHeight: "1", letterSpacing: "0", fontWeight: "400" }],
          "label": ["11px", { lineHeight: "1.2", letterSpacing: "0.06em", fontWeight: "700" }],
          "caption": ["10px", { lineHeight: "1.2", letterSpacing: "0.06em", fontWeight: "600" }]
        }
      }
    }
  }
</script>
<style>
  body { background-color: #0B0F19; color: #dfe2f1; }
  .glass-pill { background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); }
  .card-border { border: 1px solid #1F2937; }
  .glow-red    { box-shadow: 0 0 12px 0 rgba(239, 68, 68,   0.3); }
  .glow-amber  { box-shadow: 0 0 12px 0 rgba(245, 158, 11,  0.3); }
  .glow-green  { box-shadow: 0 0 12px 0 rgba(16,  185, 129, 0.3); }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #0f131d; }
  ::-webkit-scrollbar-thumb { background: #313540; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #3c4a42; }
  .rupee { font-size: 0.62em; vertical-align: top; margin-top: 0.28em; display: inline-block; margin-right: 0.04em; opacity: 0.75; }
</style>
</head>
<body class="antialiased min-h-screen flex flex-col font-headline text-on-surface bg-background">

<!-- ═══════════════════════════════════════════════════
     TOP NAV
     ═══════════════════════════════════════════════════ -->
<nav class="sticky top-0 z-50 border-b border-outline-variant bg-surface/80 backdrop-blur-md">
  <div class="flex justify-between items-center px-6 h-14 max-w-[1440px] mx-auto w-full">
    <!-- Logo -->
    <span class="text-[20px] font-bold text-primary tracking-tight">AlphaTrack</span>
    <!-- Right side controls -->
    <div class="flex items-center gap-4">
      <!-- Help link -->
      <a href="/help" class="hidden sm:block text-[13px] text-on-surface-variant hover:text-on-surface transition-colors">
        How it works
      </a>
      <!-- Refresh button -->
      <button class="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-variant border border-outline-variant text-on-surface text-[13px] font-medium px-3 py-1.5 rounded transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
        Refresh
      </button>
      <!-- Telegram bot badge -->
      <span class="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-on-surface-variant px-2 py-1 rounded border border-outline-variant bg-surface-container" style="font-family: 'JetBrains Mono', monospace;">
        <!-- Telegram icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#2AABEE" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        @Index_TrackerBot
      </span>
    </div>
  </div>
</nav>

<main class="flex-1 px-6 py-4 flex flex-col gap-4 max-w-[1440px] mx-auto w-full">

  <!-- ═══════════════════════════════════════════════════
       MARKET OVERVIEW STRIP
       ═══════════════════════════════════════════════════ -->
  <section class="bg-surface-container-low card-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-4">
    <div class="glass-pill border border-outline-variant rounded-full px-4 py-1.5 flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-secondary-container"></span>
      <span class="text-[13px] font-semibold text-on-surface">Market Stance: Selective Accumulation</span>
    </div>
    <div class="flex gap-6">
      <div class="flex flex-col">
        <span class="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">Indices in Buy Zone</span>
        <span class="font-mono text-[18px] font-semibold text-on-surface leading-tight mt-0.5">0/3</span>
      </div>
      <div class="w-px bg-outline-variant self-stretch"></div>
      <div class="flex flex-col">
        <span class="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">Total Tracked</span>
        <span class="font-mono text-[18px] font-semibold text-on-surface leading-tight mt-0.5">3</span>
      </div>
      <div class="w-px bg-outline-variant self-stretch"></div>
      <div class="flex flex-col">
        <span class="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">Avg. Drawdown</span>
        <span class="font-mono text-[18px] font-semibold text-error leading-tight mt-0.5">-2.48%</span>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════
       PRIMARY CARDS GRID (3 built-in indices)
       ═══════════════════════════════════════════════════ -->
  <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">

    <!-- Card: WAIT state -->
    <div class="bg-[#111827] card-border rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
      <div class="flex justify-between items-start gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-[20px] font-semibold text-on-surface leading-tight">NIFTY 50</span>
            <span class="text-[11px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant font-mono">^NSEI</span>
          </div>
          <!-- Price — ₹ rendered at 0.62em via .rupee class -->
          <div class="font-mono text-[30px] font-bold text-on-surface leading-none tracking-tight">
            <span class="rupee">₹</span>24,191.45
          </div>
          <div class="font-mono text-[13px] font-medium mt-1 flex items-center gap-1 text-primary">
            <span>↑</span><span>+0.34%</span>
          </div>
        </div>
        <div class="shrink-0 px-3 py-1 rounded-full border border-error/50 bg-error/10 text-error text-[11px] font-bold tracking-wider flex items-center gap-1.5 glow-red">
          <span class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
          WAIT
        </div>
      </div>
      <!-- Range bar -->
      <div class="space-y-1.5">
        <div class="flex justify-between text-[11px] text-on-surface-variant font-mono">
          <span><span class="rupee" style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>21,281.45 (L)</span>
          <span><span class="rupee" style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>26,277.35 (H)</span>
        </div>
        <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-visible relative">
          <div class="h-full bg-on-surface-variant rounded-full relative" style="width:58%">
            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
      <!-- Stats grid -->
      <div class="grid grid-cols-2 gap-px bg-outline-variant rounded overflow-hidden">
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Month High</span>
          <span class="font-mono text-[12px] text-on-surface"><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>26,277.35</span>
        </div>
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Month Low</span>
          <span class="font-mono text-[12px] text-on-surface"><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>21,281.45</span>
        </div>
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Drawdown</span>
          <span class="font-mono text-[12px] text-error">-0.72%</span>
        </div>
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Trigger (4%)</span>
          <span class="font-mono text-[12px] text-on-surface-variant"><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>25,226.26</span>
        </div>
      </div>
      <div class="border rounded p-3 text-[12px] text-on-surface-variant leading-relaxed bg-error/5 border-error/20">
        <strong class="font-semibold text-error">Signal: </strong>Only 0.72% from peak. Wait for 4% drawdown before deploying.
      </div>
    </div>

    <!-- Card: ACCUMULATE state -->
    <div class="bg-[#111827] card-border rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
      <div class="flex justify-between items-start gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-[20px] font-semibold text-on-surface leading-tight">NIFTY Next 50</span>
            <span class="text-[11px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant font-mono">^NSMIDCP</span>
          </div>
          <div class="font-mono text-[30px] font-bold text-on-surface leading-none tracking-tight">
            <span class="rupee">₹</span>72,450.10
          </div>
          <div class="font-mono text-[13px] font-medium mt-1 flex items-center gap-1 text-error">
            <span>↓</span><span>-0.12%</span>
          </div>
        </div>
        <div class="shrink-0 px-3 py-1 rounded-full border border-secondary-container/50 bg-secondary-container/10 text-secondary-container text-[11px] font-bold tracking-wider flex items-center gap-1.5 glow-amber">
          <span class="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
          ACCUMULATE
        </div>
      </div>
      <div class="space-y-1.5">
        <div class="flex justify-between text-[11px] text-on-surface-variant font-mono">
          <span><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>50,120.00 (L)</span>
          <span><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>78,200.50 (H)</span>
        </div>
        <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-visible relative">
          <div class="h-full bg-secondary-container rounded-full relative" style="width:79%">
            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-px bg-outline-variant rounded overflow-hidden">
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Month High</span>
          <span class="font-mono text-[12px] text-on-surface"><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>78,200.50</span>
        </div>
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Month Low</span>
          <span class="font-mono text-[12px] text-on-surface"><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>50,120.00</span>
        </div>
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Drawdown</span>
          <span class="font-mono text-[12px] text-secondary-container">-7.35%</span>
        </div>
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Trigger (5%)</span>
          <span class="font-mono text-[12px] text-on-surface-variant"><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>74,290.48</span>
        </div>
      </div>
      <div class="border rounded p-3 text-[12px] text-on-surface-variant leading-relaxed bg-secondary-container/5 border-secondary-container/20">
        <strong class="font-semibold text-secondary-container">Signal: </strong>Hovering 7.35% below peak. Partial deployment recommended before further decline.
      </div>
    </div>

    <!-- Card: BUY ZONE state -->
    <div class="bg-[#111827] card-border rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
      <div class="flex justify-between items-start gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-[20px] font-semibold text-on-surface leading-tight">NIFTY Midcap 50</span>
            <span class="text-[11px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant font-mono">^NSEMDCP50</span>
          </div>
          <div class="font-mono text-[30px] font-bold text-on-surface leading-none tracking-tight">
            <span class="rupee">₹</span>13,120.55
          </div>
          <div class="font-mono text-[13px] font-medium mt-1 flex items-center gap-1 text-primary">
            <span>↑</span><span>+0.85%</span>
          </div>
        </div>
        <div class="shrink-0 px-3 py-1 rounded-full border border-primary-container/50 bg-primary-container/10 text-primary-container text-[11px] font-bold tracking-wider flex items-center gap-1.5 glow-green">
          <span class="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
          BUY ZONE
        </div>
      </div>
      <div class="space-y-1.5">
        <div class="flex justify-between text-[11px] text-on-surface-variant font-mono">
          <span><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>10,400.20 (L)</span>
          <span><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>15,800.10 (H)</span>
        </div>
        <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-visible relative">
          <div class="h-full bg-primary-container rounded-full relative" style="width:45%">
            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-px bg-outline-variant rounded overflow-hidden">
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Month High</span>
          <span class="font-mono text-[12px] text-on-surface"><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>15,800.10</span>
        </div>
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Month Low</span>
          <span class="font-mono text-[12px] text-on-surface"><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>10,400.20</span>
        </div>
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Drawdown</span>
          <span class="font-mono text-[12px] text-error">-16.95%</span>
        </div>
        <div class="bg-[#111827] p-2.5 flex flex-col gap-1">
          <span class="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Trigger (5.5%)</span>
          <span class="font-mono text-[12px] text-primary-container"><span style="font-size:0.62em;vertical-align:top;margin-top:0.28em;display:inline-block;opacity:0.75;">₹</span>14,931.10</span>
        </div>
      </div>
      <div class="border rounded p-3 text-[12px] text-on-surface-variant leading-relaxed bg-primary-container/5 border-primary-container/20">
        <strong class="font-semibold text-primary-container">Signal: </strong>Signal triggered at 16.95% drawdown. Aggressive accumulation suggested.
      </div>
    </div>

  </section>

  <!-- ═══════════════════════════════════════════════════
       CUSTOM INDICES SECTION
       Two states shown below: (A) empty, (B) with a card
       ═══════════════════════════════════════════════════ -->

  <!-- State A — no custom indices yet -->
  <div class="flex justify-center">
    <button class="flex items-center gap-2 text-[13px] text-on-surface-variant hover:text-primary border border-dashed border-outline-variant hover:border-primary/50 rounded-lg px-5 py-3 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      Track another index
    </button>
  </div>

  <!-- State B — custom index section header + card example -->
  <section class="flex flex-col gap-3 mt-2">
    <div class="flex items-center justify-between">
      <h2 class="text-[13px] uppercase font-bold text-on-surface-variant tracking-wider">Custom Indices</h2>
      <button class="flex items-center gap-1 text-[12px] text-on-surface-variant hover:text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Add more
      </button>
    </div>
    <!-- Custom card with hover-remove button overlay -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="relative group">
        <div class="bg-[#111827] card-border rounded-xl p-5 flex flex-col gap-4">
          <div class="flex justify-between items-start gap-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[20px] font-semibold text-on-surface">NIFTY Bank</span>
                <span class="text-[11px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant font-mono">^NSEBANK</span>
              </div>
              <div class="font-mono text-[30px] font-bold text-on-surface leading-none tracking-tight">
                <span class="rupee">₹</span>54,382.10
              </div>
              <div class="font-mono text-[13px] font-medium mt-1 flex items-center gap-1 text-error">
                <span>↓</span><span>-0.45%</span>
              </div>
            </div>
            <div class="shrink-0 px-3 py-1 rounded-full border border-error/50 bg-error/10 text-error text-[11px] font-bold tracking-wider flex items-center gap-1.5 glow-red">
              <span class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
              WAIT
            </div>
          </div>
        </div>
        <!-- Remove button — visible on hover -->
        <button class="absolute top-3 right-3 w-6 h-6 rounded-full bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-error hover:border-error/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════
       ADD INDEX MODAL
       ═══════════════════════════════════════════════════ -->
  <div class="mt-8 border border-outline-variant rounded-xl bg-surface-container overflow-hidden max-w-md mx-auto w-full">
    <!-- Modal header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
      <span class="text-[15px] font-bold text-on-surface">Add Index to Dashboard</span>
      <button class="text-on-surface-variant hover:text-on-surface p-1 rounded">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
    <div class="px-5 py-4 flex flex-col gap-4">
      <!-- Search field -->
      <div class="flex flex-col gap-1">
        <span class="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">Search Index</span>
        <div class="relative flex items-center">
          <svg class="absolute left-3 text-on-surface-variant" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Type to search — e.g. NIFTY Bank, BSE, Sensex…"
            class="w-full bg-surface border border-outline-variant rounded text-[13px] text-on-surface pl-8 pr-3 py-1.5 outline-none focus:border-primary placeholder:text-on-surface-variant placeholder:opacity-50"/>
        </div>
        <!-- Dropdown result example -->
        <div class="bg-surface-container-high border border-outline-variant rounded-lg overflow-hidden mt-1">
          <div class="flex items-start gap-3 px-4 py-2.5 hover:bg-surface-variant cursor-pointer">
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-on-surface-variant shrink-0 mt-0.5">^NSEBANK</span>
            <div class="flex flex-col">
              <span class="text-[13px] text-on-surface leading-tight">NIFTY BANK</span>
              <span class="text-[10px] text-on-surface-variant">NSI</span>
            </div>
          </div>
          <div class="flex items-start gap-3 px-4 py-2.5 hover:bg-surface-variant cursor-pointer">
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-on-surface-variant shrink-0 mt-0.5">^CNXIT</span>
            <div class="flex flex-col">
              <span class="text-[13px] text-on-surface leading-tight">NIFTY IT</span>
              <span class="text-[10px] text-on-surface-variant">NSI</span>
            </div>
          </div>
          <div class="flex items-start gap-3 px-4 py-2.5 opacity-40 cursor-not-allowed">
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-on-surface-variant shrink-0 mt-0.5">^NSEI</span>
            <div class="flex flex-col">
              <span class="text-[13px] text-on-surface leading-tight">NIFTY 50</span>
              <span class="text-[10px] text-on-surface-variant">SNP</span>
            </div>
            <span class="text-[10px] text-on-surface-variant ml-auto">Added</span>
          </div>
        </div>
        <p class="text-[11px] text-on-surface-variant opacity-70">Searches Yahoo Finance for index symbols in real time.</p>
      </div>
      <!-- Form fields -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">Ticker Symbol</span>
          <input type="text" value="^NSEBANK" class="w-full bg-surface border border-primary rounded text-[13px] font-mono text-on-surface px-2.5 py-1.5 outline-none"/>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">Short Name</span>
          <input type="text" value="Bank" class="w-full bg-surface border border-outline-variant rounded text-[13px] text-on-surface px-2.5 py-1.5 outline-none"/>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">Display Name</span>
        <input type="text" value="NIFTY Bank" class="w-full bg-surface border border-outline-variant rounded text-[13px] text-on-surface px-2.5 py-1.5 outline-none"/>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">Buy Zone %</span>
          <input type="number" value="5.0" class="w-full bg-surface border border-outline-variant rounded text-[13px] font-mono text-on-surface px-2.5 py-1.5 outline-none"/>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">Accumulate %</span>
          <input type="number" value="2.5" class="w-full bg-surface border border-outline-variant rounded text-[13px] font-mono text-on-surface px-2.5 py-1.5 outline-none"/>
        </div>
      </div>
    </div>
    <!-- Modal footer -->
    <div class="px-5 py-4 border-t border-outline-variant flex justify-end gap-2">
      <button class="text-[13px] px-4 py-1.5 rounded border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors">Cancel</button>
      <button class="text-[13px] px-4 py-1.5 rounded bg-primary text-on-primary font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Add to Dashboard
      </button>
    </div>
  </div>

  <p class="text-center text-on-surface-variant text-[11px] py-4">
    Data via Yahoo Finance · Not financial advice · For educational purposes only
  </p>

</main>
</body></html>
