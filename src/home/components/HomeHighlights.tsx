import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { pulseHighlights } from "../constants";

const HomeHighlights: React.FC = () => {
  return (
    <section
      id="home-highlights"
      className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.15fr)]"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-[0_24px_70px_rgba(17,55,95,0.12)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#ffd861] via-[#ffe48c] to-[#32c5f4]" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#1f3047]/55">
            Spotlight
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[#0f2a4a] sm:text-3xl">
            {pulseHighlights.spotlight.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#1f3047]/75">
            {pulseHighlights.spotlight.description}
          </p>
          <Link
            to={pulseHighlights.spotlight.to}
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#0f2a4a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(15,42,74,0.3)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,42,74,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a4a]"
          >
            {pulseHighlights.spotlight.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
          {pulseHighlights.metrics.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#ecf1f8] bg-[#f9fbff] px-5 py-4 shadow-[0_10px_26px_rgba(17,55,95,0.08)]"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#1f3047]/60">
                <TrendingUp className="h-4 w-4 text-[#ecbe1d]" />
                {item.label}
              </div>
              <p className="mt-3 text-3xl font-semibold text-[#0f2a4a]">
                {item.value}
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#1f3047]/50">
                {item.trend}
              </p>
              <p className="mt-2 text-sm text-[#1f3047]/70">{item.caption}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/70 bg-[#0f2a4a] p-8 text-white shadow-[0_26px_70px_rgba(7,27,52,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/65">
          Culture Sparks
        </p>
        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
          Celebrate the rituals that keep squads energised.
        </h3>
        <ul className="mt-8 space-y-6">
          {pulseHighlights.sparks.map((spark) => (
            <li key={spark.id} className="group rounded-2xl bg-white/5 p-4 transition-colors duration-300 hover:bg-white/10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                {spark.title}
              </p>
              <p className="mt-2 text-base text-white/90">
                {spark.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#ecbe1d] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Learn more
                <ArrowRight className="h-3 w-3" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HomeHighlights;
