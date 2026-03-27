/**
 * API client for fetching data from the backend
 */

import type {
  GamesResponse,
  TodayResponse,
  TeamsResponse,
  StatsResponse,
  PredictionsResponse
} from './types';

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function getTodayGames(): Promise<TodayResponse> {
  return fetchAPI<TodayResponse>('/today');
}

export async function getGames(params?: {
  date?: string;
  status?: string;
  limit?: number;
}): Promise<GamesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.date) searchParams.set('date', params.date);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  return fetchAPI<GamesResponse>(`/games${query ? `?${query}` : ''}`);
}

export async function getTeams(withStats = false): Promise<TeamsResponse> {
  return fetchAPI<TeamsResponse>(`/teams${withStats ? '?stats=true' : ''}`);
}

export async function getStats(): Promise<StatsResponse> {
  return fetchAPI<StatsResponse>('/stats');
}

export async function getPredictions(params?: {
  gameId?: number;
  limit?: number;
  includeResults?: boolean;
}): Promise<PredictionsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.gameId) searchParams.set('game_id', params.gameId.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.includeResults) searchParams.set('results', 'true');

  const query = searchParams.toString();
  return fetchAPI<PredictionsResponse>(`/predictions${query ? `?${query}` : ''}`);
}
