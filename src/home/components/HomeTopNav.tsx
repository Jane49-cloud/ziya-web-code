import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { clearZiyaSession, triggerLogoutNotice } from "../../utils";

interface HomeTopNavProps {
  anchors: { id: string; label: string }[];
}

const NAV_HEIGHT = 80;

const HomeTopNav = ({ anchors }: HomeTopNavProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Track which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    anchors.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, [anchors]);

  const handleAnchorClick = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(targetId);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    clearZiyaSession();
    triggerLogoutNotice();
    navigate("/auth/login");
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 shadow-[0_4px_24px_rgba(15,42,74,0.10)] backdrop-blur-md"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      {/* Main bar */}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-12">
        {/* Logo + date */}
        <div className="flex items-center gap-3">
          <RouterLink to="/" className="flex items-center gap-2">
            <img
              src="/media/logos/Ziya_logo_transparent_bg.png"
              alt="Ziya logo"
              className="h-9 w-auto object-contain"
            />
            <span className="hidden text-base font-semibold text-[#0f2a4a] sm:inline">
              Ziya
            </span>
          </RouterLink>
          <span className="hidden h-5 w-px rounded-full bg-[#d8e4f2] lg:inline" />
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1f3047]/40 lg:block">
            {todayLabel}
          </p>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {anchors.map((anchor) => {
            const isActive = activeId === anchor.id;
            return (
              <button
                key={anchor.id}
                type="button"
                onClick={() => handleAnchorClick(anchor.id)}
                className={`relative rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] transition-colors duration-200 ${
                  isActive
                    ? "text-[#0f2a4a]"
                    : "text-[#1f3047]/65 hover:bg-[#f0f7ff] hover:text-[#0f2a4a]"
                }`}
              >
                <span className="relative">
                  {anchor.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #32c5f4, #ecbe1d)",
                      }}
                    />
                  )}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-3 rounded-full bg-[#ecbe1d] px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#0f2a4a] shadow-sm transition-colors hover:bg-[#d7a70f]"
          >
            Logout
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((o) => !o)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3ebf6] bg-white text-[#1f3047] transition hover:border-[#32c5f4] lg:hidden"
        >
          {isMenuOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M1 3h14M1 8h14M1 13h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`overflow-hidden border-t border-[#e3ebf6] bg-white/95 backdrop-blur-md transition-all duration-300 lg:hidden ${
          isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 pt-3">
          {anchors.map((anchor) => {
            const isActive = activeId === anchor.id;
            return (
              <button
                key={anchor.id}
                type="button"
                onClick={() => handleAnchorClick(anchor.id)}
                className={`relative w-full overflow-hidden rounded-lg px-4 py-2.5 text-left text-sm font-semibold uppercase tracking-[0.25em] transition-colors ${
                  isActive
                    ? "bg-[#f0f7ff] text-[#0f2a4a]"
                    : "text-[#1f3047]/65 hover:bg-[#f0f7ff] hover:text-[#0f2a4a]"
                }`}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-0 h-full w-[3px] rounded-r-full"
                    style={{
                      background: "linear-gradient(180deg, #32c5f4, #ecbe1d)",
                    }}
                  />
                )}
                {anchor.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full rounded-lg bg-[#ecbe1d] py-2.5 text-sm font-semibold uppercase tracking-[0.25em] text-[#0f2a4a] shadow-sm transition-colors hover:bg-[#d7a70f]"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default HomeTopNav;
