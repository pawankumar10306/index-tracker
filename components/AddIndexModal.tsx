'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus, Loader2, Search } from 'lucide-react';
import type { CustomIndexConfig } from './CustomIndexSection';
import type { SearchResult } from '@/app/api/search/route';

interface Props {
  isOpen: boolean;
  existingTickers: string[];
  onClose: () => void;
  onSave: (config: CustomIndexConfig) => void;
}

const EMPTY: CustomIndexConfig = {
  ticker: '',
  name: '',
  shortName: '',
  buyZone: 5.0,
  waitAccumulate: 2.5,
};

export function AddIndexModal({ isOpen, existingTickers, onClose, onSave }: Props) {
  const [form, setForm] = useState<CustomIndexConfig>(EMPTY);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isOpen) return null;

  function handleQueryChange(value: string) {
    setQuery(value);
    setError('');
    clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const items = (await res.json()) as SearchResult[];
        setSearchResults(items);
        setShowDropdown(items.length > 0);
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setSearching(false);
      }
    }, 350);
  }

  function selectResult(item: SearchResult) {
    const derived = item.shortName || item.name.split(/\s+/).slice(-1)[0];
    setForm((f) => ({
      ...f,
      ticker: item.symbol,
      name: item.name,
      shortName: derived,
    }));
    setQuery(item.name);
    setShowDropdown(false);
    setError('');
  }

  function set(field: keyof CustomIndexConfig, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  }

  async function handleSave() {
    const ticker = form.ticker.trim().toUpperCase();
    const name = form.name.trim();
    if (!ticker) { setError('Select or enter a ticker symbol.'); return; }
    if (!name)   { setError('Display name is required.'); return; }
    if (form.buyZone <= form.waitAccumulate) {
      setError('Buy Zone % must be greater than Accumulate %.');
      return;
    }
    if (existingTickers.includes(ticker)) {
      setError(`${ticker} is already on your dashboard.`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const params = new URLSearchParams({
        ticker,
        name,
        shortName: form.shortName.trim() || name,
        buyZone: String(form.buyZone),
        waitAccumulate: String(form.waitAccumulate),
      });
      const res = await fetch(`/api/signals/lookup?${params}`);
      const data = await res.json();
      if (data.error && !data.currentPrice) {
        setError(`Could not fetch "${ticker}": ${data.error}`);
        return;
      }
      onSave({ ...form, ticker, name, shortName: form.shortName.trim() || name });
      setForm(EMPTY);
      setQuery('');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error — try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-surface-container border border-outline-variant rounded-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
          <span className="text-[15px] font-bold text-on-surface">Add Index to Dashboard</span>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          {/* Search */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">
              Search Index
            </span>
            <div className="relative" ref={dropdownRef}>
              <div className="relative flex items-center">
                {searching ? (
                  <Loader2 size={13} className="absolute left-3 text-on-surface-variant animate-spin" />
                ) : (
                  <Search size={13} className="absolute left-3 text-on-surface-variant" />
                )}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  placeholder="Type to search — e.g. NIFTY Bank, BSE, Sensex…"
                  className="input-base pl-8"
                  autoComplete="off"
                />
              </div>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-high border border-outline-variant rounded-lg overflow-hidden shadow-xl z-20 max-h-52 overflow-y-auto">
                  {searchResults.map((item) => {
                    const taken = existingTickers.includes(item.symbol);
                    return (
                      <button
                        key={item.symbol}
                        disabled={taken}
                        onClick={() => selectResult(item)}
                        className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors
                          ${taken ? 'opacity-40 cursor-not-allowed' : 'hover:bg-surface-variant'}`}
                      >
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant text-on-surface-variant shrink-0 mt-0.5"
                        >
                          {item.symbol}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] text-on-surface leading-tight truncate">{item.name}</span>
                          {item.exchange && (
                            <span className="text-[10px] text-on-surface-variant">{item.exchange}</span>
                          )}
                        </div>
                        {taken && (
                          <span className="text-[10px] text-on-surface-variant ml-auto shrink-0">Added</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant opacity-70">
              Searches Yahoo Finance for index symbols in real time.
            </p>
          </div>

          {/* Selected / manual ticker */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ticker Symbol">
              <input
                type="text"
                value={form.ticker}
                onChange={(e) => set('ticker', e.target.value.toUpperCase())}
                placeholder="^NSEBANK"
                className="input-base font-mono"
              />
            </Field>
            <Field label="Short Name" hint="optional">
              <input
                type="text"
                value={form.shortName}
                onChange={(e) => set('shortName', e.target.value)}
                placeholder="Bank"
                className="input-base"
              />
            </Field>
          </div>

          <Field label="Display Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="NIFTY Bank"
              className="input-base"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Buy Zone %" hint="drawdown to trigger">
              <input
                type="number"
                step="0.25"
                min="1"
                max="30"
                value={form.buyZone}
                onChange={(e) => set('buyZone', parseFloat(e.target.value) || 0)}
                className="input-base font-mono"
              />
            </Field>
            <Field label="Accumulate %" hint="mid-zone threshold">
              <input
                type="number"
                step="0.25"
                min="0.5"
                max="20"
                value={form.waitAccumulate}
                onChange={(e) => set('waitAccumulate', parseFloat(e.target.value) || 0)}
                className="input-base font-mono"
              />
            </Field>
          </div>

          {error && (
            <p className="text-[12px] text-error bg-error/5 border border-error/20 rounded px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-[13px] px-4 py-1.5 rounded border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[13px] px-4 py-1.5 rounded bg-primary text-on-primary font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Validating…
              </>
            ) : (
              <>
                <Plus size={13} />
                Add to Dashboard
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .input-base {
          width: 100%;
          background: #0f131d;
          border: 1px solid #3c4a42;
          border-radius: 0.25rem;
          color: #dfe2f1;
          font-size: 13px;
          padding: 0.375rem 0.625rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base:focus { border-color: #4edea3; }
        .input-base::placeholder { color: #bbcabf; opacity: 0.5; }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">{label}</span>
        {hint && <span className="text-[10px] text-on-surface-variant opacity-60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
