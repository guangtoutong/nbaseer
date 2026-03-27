"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useGames, GamesData } from './useGames';

const GamesContext = createContext<GamesData | null>(null);

export function GamesProvider({ children }: { children: ReactNode }) {
  const gamesData = useGames();

  return (
    <GamesContext.Provider value={gamesData}>
      {children}
    </GamesContext.Provider>
  );
}

export function useGamesContext(): GamesData {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error('useGamesContext must be used within a GamesProvider');
  }
  return context;
}
