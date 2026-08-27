'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { SignalCard } from './SignalCard';
import { AddIndexModal } from './AddIndexModal';
import type { SignalResult } from '@/types';

export interface CustomIndexConfig {
  ticker: string;
  name: string;
  shortName: string;
  buyZone: number;
  waitAccumulate: number;
}

const STORAGE_KEY = 'alphatrack_custom_indices';

function loadConfigs(): CustomIndexConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomIndexConfig[]) : [];
  } catch {
    return [];
  }
}

function saveConfigs(configs: CustomIndexConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; result: SignalResult };

async function fetchSignal(cfg: CustomIndexConfig): Promise<SignalResult> {
  const params = new URLSearchParams({
    ticker: cfg.ticker,
    name: cfg.name,
    shortName: cfg.shortName,
    buyZone: String(cfg.buyZone),
    waitAccumulate: String(cfg.waitAccumulate),
  });
  const res = await fetch(`/api/signals/lookup?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<SignalResult>;
}

export function CustomIndexSection() {
  const [configs, setConfigs] = useState<CustomIndexConfig[]>([]);
  const [signals, setSignals] = useState<Map<string, FetchState>>(new Map());
  const [modalOpen, setModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const loaded = loadConfigs();
    setConfigs(loaded);
    setHydrated(true);
  }, []);

  // Fetch signals whenever configs change
  const refreshAll = useCallback((cfgs: CustomIndexConfig[]) => {
    cfgs.forEach((cfg) => {
      setSignals((prev) => new Map(prev).set(cfg.ticker, { status: 'loading' }));
      fetchSignal(cfg)
        .then((result) =>
          setSignals((prev) => new Map(prev).set(cfg.ticker, { status: 'done', result }))
        )
        .catch((err) => {
          const errorResult: SignalResult = {
            ticker: cfg.ticker,
            name: cfg.name,
            shortName: cfg.shortName,
            currentPrice: 0,
            monthlyHigh: 0,
            monthlyLow: 0,
            fallFromHighPct: 0,
            riseFromLowPct: 0,
            triggerPrice: 0,
            buyZoneThreshold: cfg.buyZone,
            signal: 'WAIT',
            signalLabel: 'WAIT',
            signalEmoji: '🔴',
            fetchedAt: new Date().toISOString(),
            error: err instanceof Error ? err.message : String(err),
          };
          setSignals((prev) => new Map(prev).set(cfg.ticker, { status: 'done', result: errorResult }));
        });
    });
  }, []);

  useEffect(() => {
    if (hydrated && configs.length > 0) refreshAll(configs);
  }, [hydrated, configs, refreshAll]);

  function handleSave(cfg: CustomIndexConfig) {
    const next = [...configs, cfg];
    setConfigs(next);
    saveConfigs(next);
  }

  function handleRemove(ticker: string) {
    const next = configs.filter((c) => c.ticker !== ticker);
    setConfigs(next);
    saveConfigs(next);
    setSignals((prev) => {
      const m = new Map(prev);
      m.delete(ticker);
      return m;
    });
  }

  const allTickers = configs.map((c) => c.ticker);

  // Don't render anything until hydrated to avoid mismatch
  if (!hydrated) return null;

  return (
    <>
      {configs.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] uppercase font-bold text-on-surface-variant tracking-wider">
              Custom Indices
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 text-[12px] text-on-surface-variant hover:text-primary transition-colors"
            >
              <Plus size={13} />
              Add more
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {configs.map((cfg) => {
              const state = signals.get(cfg.ticker) ?? { status: 'idle' };
              return (
                <div key={cfg.ticker} className="relative group">
                  {state.status === 'loading' || state.status === 'idle' ? (
                    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 flex items-center justify-center min-h-[200px]">
                      <Loader2 size={20} className="animate-spin text-on-surface-variant" />
                    </div>
                  ) : (
                    <SignalCard result={state.result} />
                  )}
                  {/* Remove button — visible on hover */}
                  <button
                    onClick={() => handleRemove(cfg.ticker)}
                    title={`Remove ${cfg.name}`}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-error hover:border-error/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {configs.length === 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 text-[13px] text-on-surface-variant hover:text-primary border border-dashed border-outline-variant hover:border-primary/50 rounded-lg px-5 py-3 transition-colors"
          >
            <Plus size={14} />
            Track another index
          </button>
        </div>
      )}

      <AddIndexModal
        isOpen={modalOpen}
        existingTickers={allTickers}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
