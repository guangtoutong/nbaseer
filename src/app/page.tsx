"use client";

import { HeroSection } from "@/components/HeroSection";
import { LiveGames } from "@/components/LiveGames";
import { UpcomingGames } from "@/components/UpcomingGames";
import { CompletedGames } from "@/components/CompletedGames";
import { GamesProvider } from "@/lib/GamesContext";

export default function Home() {
  return (
    <GamesProvider>
      <HeroSection />
      <LiveGames />
      <UpcomingGames />
      <CompletedGames />
    </GamesProvider>
  );
}
