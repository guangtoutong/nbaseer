"use client";

import { useState, useEffect } from 'react';
import type { Game, TodayResponse } from './types';

export interface GamesData {
  live: Game[];
  scheduled: Game[];
  completed: Game[];
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
}

const EMPTY: Omit<GamesData, 'isLoading' | 'error'> = {
  live: [],
  scheduled: [],
  completed: [],
  lastUpdated: '',
};

/** Poll faster while something is actually in progress. */
const IDLE_INTERVAL_MS = 120_000;
const LIVE_INTERVAL_MS = 30_000;

export function useGames(): GamesData {
  const [data, setData] = useState<GamesData>({
    ...EMPTY,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function fetchGames() {
      try {
        const response = await fetch('/api/today');
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const result: TodayResponse = await response.json();
        if (cancelled) return;

        setData({
          live: result.live || [],
          scheduled: result.scheduled || [],
          completed: result.completed || [],
          lastUpdated: result.lastUpdated || new Date().toISOString(),
          isLoading: false,
          error: null,
        });

        schedule((result.live || []).length > 0 ? LIVE_INTERVAL_MS : IDLE_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        // No games is a real answer on an off day. Showing invented fixtures
        // instead would be worse than showing nothing.
        console.error('Failed to fetch games:', err);
        setData({
          ...EMPTY,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        schedule(IDLE_INTERVAL_MS);
      }
    }

    function schedule(delay: number) {
      if (!cancelled) timer = setTimeout(fetchGames, delay);
    }

    fetchGames();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return data;
}
