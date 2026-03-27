"use client";

import { useState, useEffect } from 'react';
import type { Game, TodayResponse } from './types';

// Mock data for development/fallback
const mockLiveGames: Game[] = [
  {
    id: 1,
    date: new Date().toISOString().split('T')[0],
    time: '08:42',
    status: 'live',
    period: 4,
    home_team_id: 14,
    away_team_id: 10,
    home_score: 104,
    away_score: 101,
    season: 2024,
    postseason: 0,
    home_abbr: 'LAL',
    away_abbr: 'GSW',
    home_team_cn: '湖人',
    away_team_cn: '勇士',
    home_win_prob: 62.5,
    away_win_prob: 37.5,
    predicted_spread: -3.5,
    predicted_total: 225,
    confidence: 0.72,
  },
  {
    id: 2,
    date: new Date().toISOString().split('T')[0],
    time: '03:15',
    status: 'live',
    period: 3,
    home_team_id: 2,
    away_team_id: 17,
    home_score: 76,
    away_score: 82,
    season: 2024,
    postseason: 0,
    home_abbr: 'BOS',
    away_abbr: 'MIL',
    home_team_cn: '凯尔特人',
    away_team_cn: '雄鹿',
    home_win_prob: 41.8,
    away_win_prob: 58.2,
    predicted_spread: 2.5,
    predicted_total: 228,
    confidence: 0.65,
  },
];

const mockScheduledGames: Game[] = [
  {
    id: 3,
    date: new Date().toISOString().split('T')[0],
    time: '07:30',
    status: 'scheduled',
    period: 0,
    home_team_id: 24,
    away_team_id: 8,
    home_score: 0,
    away_score: 0,
    season: 2024,
    postseason: 0,
    home_abbr: 'PHX',
    away_abbr: 'DEN',
    home_team_cn: '太阳',
    away_team_cn: '掘金',
    home_win_prob: 58.4,
    away_win_prob: 41.6,
    predicted_spread: -4.5,
    predicted_total: 232.5,
    confidence: 0.88,
  },
  {
    id: 4,
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    status: 'scheduled',
    period: 0,
    home_team_id: 16,
    away_team_id: 23,
    home_score: 0,
    away_score: 0,
    season: 2024,
    postseason: 0,
    home_abbr: 'MIA',
    away_abbr: 'PHI',
    home_team_cn: '热火',
    away_team_cn: '76人',
    home_win_prob: 52,
    away_win_prob: 48,
    predicted_spread: -2.5,
    predicted_total: 202.5,
    confidence: 0.55,
  },
];

const mockCompletedGames: Game[] = [
  {
    id: 5,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: null,
    status: 'final',
    period: 4,
    home_team_id: 7,
    away_team_id: 13,
    home_score: 126,
    away_score: 114,
    season: 2024,
    postseason: 0,
    home_abbr: 'DAL',
    away_abbr: 'LAC',
    home_team_cn: '独行侠',
    away_team_cn: '快船',
    home_win_prob: 55,
    away_win_prob: 45,
    predicted_spread: -10.5,
    predicted_total: 230,
    confidence: 0.7,
    winner_correct: 1,
  },
  {
    id: 6,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: null,
    status: 'final',
    period: 4,
    home_team_id: 6,
    away_team_id: 20,
    home_score: 105,
    away_score: 98,
    season: 2024,
    postseason: 0,
    home_abbr: 'CLE',
    away_abbr: 'NYK',
    home_team_cn: '骑士',
    away_team_cn: '尼克斯',
    home_win_prob: 48,
    away_win_prob: 52,
    predicted_spread: 4.2,
    predicted_total: 215,
    confidence: 0.6,
    winner_correct: 0,
  },
  {
    id: 7,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: null,
    status: 'final',
    period: 4,
    home_team_id: 21,
    away_team_id: 15,
    home_score: 132,
    away_score: 118,
    season: 2024,
    postseason: 0,
    home_abbr: 'OKC',
    away_abbr: 'MEM',
    home_team_cn: '雷霆',
    away_team_cn: '灰熊',
    home_win_prob: 72,
    away_win_prob: 28,
    predicted_spread: -15,
    predicted_total: 245,
    confidence: 0.85,
    winner_correct: 1,
  },
  {
    id: 8,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: null,
    status: 'final',
    period: 4,
    home_team_id: 18,
    away_team_id: 26,
    home_score: 110,
    away_score: 107,
    season: 2024,
    postseason: 0,
    home_abbr: 'MIN',
    away_abbr: 'SAC',
    home_team_cn: '森林狼',
    away_team_cn: '国王',
    home_win_prob: 58,
    away_win_prob: 42,
    predicted_spread: -2.8,
    predicted_total: 220,
    confidence: 0.62,
    winner_correct: 1,
  },
];

export interface GamesData {
  live: Game[];
  scheduled: Game[];
  completed: Game[];
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
  useMockData: boolean;
}

export function useGames(): GamesData {
  const [data, setData] = useState<GamesData>({
    live: [],
    scheduled: [],
    completed: [],
    lastUpdated: '',
    isLoading: true,
    error: null,
    useMockData: false,
  });

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch('/api/today');

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result: TodayResponse = await response.json();

        // Check if we got real data
        const hasRealData =
          (result.live?.length > 0) ||
          (result.scheduled?.length > 0) ||
          (result.completed?.length > 0);

        if (hasRealData) {
          setData({
            live: result.live || [],
            scheduled: result.scheduled || [],
            completed: result.completed || [],
            lastUpdated: result.lastUpdated || new Date().toISOString(),
            isLoading: false,
            error: null,
            useMockData: false,
          });
        } else {
          // Fall back to mock data if database is empty
          setData({
            live: mockLiveGames,
            scheduled: mockScheduledGames,
            completed: mockCompletedGames,
            lastUpdated: new Date().toISOString(),
            isLoading: false,
            error: null,
            useMockData: true,
          });
        }
      } catch (err) {
        console.error('Failed to fetch games:', err);
        // Fall back to mock data on error
        setData({
          live: mockLiveGames,
          scheduled: mockScheduledGames,
          completed: mockCompletedGames,
          lastUpdated: new Date().toISOString(),
          isLoading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          useMockData: true,
        });
      }
    }

    fetchGames();

    // Refresh every 30 seconds
    const interval = setInterval(fetchGames, 30000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
