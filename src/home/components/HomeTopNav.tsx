import { useMemo } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { clearZiyaSession } from "../../utils";

interface HomeTopNavProps {
  anchors: { id: string; label: string }[];
}

const HomeTopNav: React.FC<HomeTopNavProps> = ({ anchors }) => {
  const navigate = useNavigate();
  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date());
  }, []);

  const handleAnchorClick = (targetId: string) => {
    if (typeof window === "undefined") return;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogout = () => {
    clearZiyaSession();
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-4 z-40 flex w-full flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/90 px-4 py-4 shadow-[0_22px_65px_rgba(15,53,94,0.12)] backdrop-blur-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <RouterLink to="/" className="flex items-center gap-3">
          <img
            src="/media/logos/Ziya_logo_transparent_bg.png"
            alt="Ziya logo"
            className="h-12 w-auto object-contain"
          />
          <span className="hidden text-lg font-semibold text-[#0f2a4a] sm:inline">
            Ziya Home
          </span>
        </RouterLink>
        <span className="hidden h-8 w-px rounded-full bg-[#d8e4f2] lg:inline" />
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#1f3047]/50">
          {todayLabel}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
        <nav className="flex flex-wrap items-center gap-2 lg:gap-3">
          {anchors.map((anchor) => (
            <button
              key={anchor.id}
              onClick={() => handleAnchorClick(anchor.id)}
              className="inline-flex items-center rounded-full border border-[#e3ebf6] bg-[#f8fbff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#1f3047]/70 transition-colors duration-200 hover:border-[#32c5f4] hover:text-[#0f2a4a]"
              type="button"
            >
              {anchor.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center rounded-full bg-[#ecbe1d] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#0f2a4a] shadow-sm transition hover:bg-[#d7a70f]"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default HomeTopNav;
