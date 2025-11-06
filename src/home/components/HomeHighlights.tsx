import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { pulseHighlights } from "../constants";

const HomeHighlights: React.FC = () => {
  return (
    <section
      id="home-highlights"
      className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.15fr)]"
    >
      {/* Left: Spotlight + Metrics */}
      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_24px_70px_rgba(17,55,95,0.12)] ring-1 ring-black/5">
        {/* top accent */}
        <div className="pointer-events-none h-1.5 w-full bg-gradient-to-r from-[#ffd861] via-[#ffe48c] to-[#32c5f4]" />
        <div className="p-8 sm:p-10">
          <div className="relative">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#1f3047]/60">
              Spotlight
            </p>
            <h2 className="mt-2.5 text-[1.75rem] sm:text-[2rem] font-semibold leading-tight text-[#0f2a4a]">
              {pulseHighlights.spotlight.title}
            </h2>
            <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-[#1f3047]/75">
              {pulseHighlights.spotlight.description}
            </p>

            <Link
              to={pulseHighlights.spotlight.to}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#0f2a4a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(15,42,74,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(15,42,74,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a4a]"
            >
              {pulseHighlights.spotlight.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Metrics */}
          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            {pulseHighlights.metrics.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-[#ecf1f8] bg-[#f9fbff] px-5 py-4 shadow-[0_10px_26px_rgba(17,55,95,0.08)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_18px_36px_rgba(17,55,95,0.12)]"
              >
                <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#1f3047]/65">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff7db] text-[#7a5a00]">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  {item.label}
                </div>

                <p className="mt-3 text-3xl font-semibold leading-none text-[#0f2a4a]">
                  {item.value}
                </p>

                <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#1f3047]/55">
                  {item.trend}
                </p>

                <p className="mt-2 text-sm text-[#1f3047]/70">{item.caption}</p>
              </div>
            ))}
          </div>
        </div>

        {/* soft blobs */}
        <div className="pointer-events-none absolute -top-12 -right-6 h-24 w-24 rounded-full bg-[#ffe38f]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-28 w-28 rounded-full bg-[#32c5f4]/25 blur-3xl" />
      </div>

      {/* Right: Culture Sparks */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-[#0f2a4a] text-white shadow-[0_26px_70px_rgba(7,27,52,0.35)] ring-1 ring-white/10">
        {/* top accent */}
        <div className="pointer-events-none h-1.5 w-full bg-gradient-to-r from-white/10 via-white/30 to-white/10" />
        <div className="p-8 sm:p-10">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/70">
            Culture Sparks
          </p>
          <h3 className="mt-2.5 text-[1.6rem] sm:text-[1.85rem] font-semibold leading-snug">
            Celebrate the rituals that keep squads energised.
          </h3>

          <ul className="mt-8 space-y-5">
            {pulseHighlights.sparks.map((spark) => (
              <li
                key={spark.id}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10 hover:-translate-y-[2px]"
              >
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-white/75">
                  {spark.title}
                </p>
                <p className="mt-1.5 text-[0.98rem] leading-relaxed text-white/90">
                  {spark.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#ecbe1d] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* soft glow */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 -right-10 h-28 w-28 rounded-full bg-[#ecbe1d]/20 blur-3xl" />
      </div>
    </section>
  );
};

export default HomeHighlights;
