'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-variant border border-outline-variant text-on-surface text-[13px] font-medium px-3 py-1.5 rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw size={13} className={isPending ? 'animate-spin' : ''} />
      {isPending ? 'Refreshing…' : 'Refresh'}
    </button>
  );
}
