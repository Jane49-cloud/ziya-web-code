import { useMemo } from "react";
import HomeHero from "./components/HomeHero";
import HomeCardGrid from "./components/HomeCardGrid";
import HomeHighlights from "./components/HomeHighlights";
import HomeTopNav from "./components/HomeTopNav";
import { homeCards } from "./constants";
import { getRole, getUser } from "../utils";

const HomePage: React.FC = () => {
  const user = useMemo(() => getUser(), []);
  const role = useMemo(() => getRole(), []);

  const firstName = user?.firstname ?? "Ziya";
  const roleLabel = role ?? null;

  return (
    <div className="relative min-h-screen bg-[#f6fafc]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#fef6d8] via-[#fefbf0] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-24 h-40 w-40 rounded-full bg-[#bfe6ff]/60 blur-[120px]" />
      <div className="pointer-events-none absolute left-[-6rem] top-1/3 h-48 w-48 rounded-full bg-[#ffe69a]/50 blur-[120px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-6 lg:px-12">
        <HomeTopNav
          anchors={[
            { id: "home-overview", label: "Overview" },
            { id: "home-programs", label: "Programs" },
            { id: "home-highlights", label: "Highlights" },
          ]}
        />
        <HomeHero firstName={firstName} roleLabel={roleLabel} />
        <HomeCardGrid cards={homeCards} />
        <HomeHighlights />
      </div>
    </div>
  );
};

export default HomePage;
