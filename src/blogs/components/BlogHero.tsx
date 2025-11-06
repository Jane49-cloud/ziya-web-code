import React from "react";
import { Button, Statistic } from "antd";
import { PenSquare, Sparkles, Users, GalleryVertical } from "lucide-react";
import type { BlogSummary } from "../types";

interface BlogHeroProps {
  summary: BlogSummary;
  onCreate?: () => void;
}

const ACCENT_SHADOW: Record<"primary" | "amber" | "emerald", string> = {
  primary: "shadow-[0_10px_36px_-18px_rgba(56,189,248,0.55)]",
  amber: "shadow-[0_10px_36px_-18px_rgba(251,191,36,0.5)]",
  emerald: "shadow-[0_10px_36px_-18px_rgba(52,211,153,0.5)]",
};

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: "primary" | "amber" | "emerald";
}> = ({ title, value, icon, accent }) => {
  return (
    <div
      className={`flex flex-1 min-w-[120px] items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-xl transition duration-200 hover:bg-white/15 ${ACCENT_SHADOW[accent]}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
        {icon}
      </span>
      <Statistic
        title={
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
            {title}
          </span>
        }
        value={value}
        valueStyle={{ color: "#fff", fontSize: "1.2rem", fontWeight: 600 }}
      />
    </div>
  );
};

export const BlogHero: React.FC<BlogHeroProps> = ({ summary, onCreate }) => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a2847] via-[#243457] to-[#2d4159] px-6 py-8 text-white shadow-[0_30px_120px_-60px_rgba(8,15,35,0.85)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-44 w-44 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute top-8 right-12 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end">
        <div className="space-y-4 lg:max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
            <Sparkles size={14} /> Editorial Studio
          </span>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Share elevated insights that guide every relationship
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/75">
              Curate stories that illuminate opportunity, empower teams, and
              strengthen client trust. Create premium narratives ready for
              investor updates or community showcases.
            </p>
          </div>

          {onCreate ? (
            <Button
              type="primary"
              icon={<PenSquare size={16} />}
              size="large"
              onClick={onCreate}
              className="rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-6 font-semibold shadow-[0_14px_36px_rgba(56,189,248,0.35)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(56,189,248,0.45)]"
            >
              Compose new article
            </Button>
          ) : null}
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3 lg:max-w-lg">
          <StatCard
            title="Published"
            value={summary.published}
            icon={<GalleryVertical size={18} />}
            accent="primary"
          />
          <StatCard
            title="Drafts"
            value={summary.drafts}
            icon={<Users size={18} />}
            accent="amber"
          />
          <StatCard
            title="Total"
            value={summary.total}
            icon={<Sparkles size={18} />}
            accent="emerald"
          />
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
