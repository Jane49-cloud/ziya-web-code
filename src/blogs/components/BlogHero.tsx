import React from "react";
import { Button } from "antd";
import { PenSquare, Sparkles, Users, GalleryVertical } from "lucide-react";
import type { BlogSummary } from "../types";

interface BlogHeroProps {
  summary: BlogSummary;
  onCreate?: () => void;
}

const ACCENT_COLORS: Record<
  "primary" | "amber" | "emerald",
  { bg: string; shadow: string }
> = {
  primary: {
    bg: "bg-sky-500/15",
    shadow: "shadow-[0_8px_24px_-12px_rgba(56,189,248,0.4)]",
  },
  amber: {
    bg: "bg-amber-400/15",
    shadow: "shadow-[0_8px_24px_-12px_rgba(251,191,36,0.35)]",
  },
  emerald: {
    bg: "bg-emerald-400/15",
    shadow: "shadow-[0_8px_24px_-12px_rgba(52,211,153,0.35)]",
  },
};

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: "primary" | "amber" | "emerald";
}> = ({ title, value, icon, accent }) => {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/20 ${ACCENT_COLORS[accent].shadow}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ACCENT_COLORS[accent].bg} text-white`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
          {title}
        </div>
        <div className="text-xl font-bold text-white tabular-nums">
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export const BlogHero: React.FC<BlogHeroProps> = ({ summary, onCreate }) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a2847] via-[#243457] to-[#2d4159] shadow-[0_20px_80px_-40px_rgba(8,15,35,0.7)]">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-44 w-44 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute top-8 right-12 h-32 w-32 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[120px]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70 backdrop-blur-sm">
              <Sparkles size={13} /> Editorial Studio
            </span>

            <div className="space-y-3">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                Share elevated insights that guide every relationship
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Curate stories that illuminate opportunity, empower teams, and
                strengthen client trust. Create premium narratives ready for
                investor updates or community showcases.
              </p>
            </div>
          </div>

          {/* Bottom Section - Button and Stats */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Create Button */}
            {onCreate && (
              <Button
                type="primary"
                icon={<PenSquare size={16} />}
                size="large"
                onClick={onCreate}
                className="rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-6 font-semibold shadow-[0_10px_28px_rgba(56,189,248,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(56,189,248,0.4)] border-0"
              >
                Compose new article
              </Button>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-3">
              <StatCard
                title="Published"
                value={summary.published}
                icon={<GalleryVertical size={17} />}
                accent="primary"
              />
              <StatCard
                title="Drafts"
                value={summary.drafts}
                icon={<Users size={17} />}
                accent="amber"
              />
              <StatCard
                title="Total"
                value={summary.total}
                icon={<Sparkles size={17} />}
                accent="emerald"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
