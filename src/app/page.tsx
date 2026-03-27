import { HeroSection } from "@/components/HeroSection";
import { LiveGames } from "@/components/LiveGames";
import { UpcomingGames } from "@/components/UpcomingGames";
import { CompletedGames } from "@/components/CompletedGames";

export default function Home() {
  return (
    <>
      <HeroSection />
      <LiveGames />
      <UpcomingGames />
      <CompletedGames />
    </>
  );
}
