import React from "react";
import { Button, Statistic } from "antd";
import { PenSquare, Sparkles, Users, GalleryVertical } from "lucide-react";
import clsx from "clsx";
import type { BlogSummary } from "../types";

interface BlogHeroProps {
  summary: BlogSummary;
  onCreate?: () => void;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: "primary" | "amber" | "emerald";
}> = ({ title, value, icon, accent }) => (
  <div
    className={clsx(
      "flex flex-1 min-w-[180px] items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-white backdrop-blur",
      {
        "shadow-[0_16px_48px_-28px_rgba(59,130,246,0.85)]": accent === "primary",
        "shadow-[0_16px_48px_-28px_rgba(245,158,11,0.7)]": accent === "amber",
        "shadow-[0_16px_48px_-28px_rgba(16,185,129,0.7)]": accent === "emerald",
      }
    )}
  >
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white">
      {icon}
    </span>
    <Statistic
      title={<span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">{title}</span>}
      value={value}
      valueStyle={{ color: "#fff", fontSize: "1.75rem", fontWeight: 600 }}
    />
  </div>
);

export const BlogHero: React.FC<BlogHeroProps> = ({ summary, onCreate }) => {
  return (
    <section className="blog-hero relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0c121f] via-[#1a2842] to-[#1f2f43] px-10 py-12 text-white shadow-[0_36px_120px_-60px_rgba(8,15,35,0.9)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-24 h-56 w-56 rounded-full bg-sky-500/40 blur-3xl" />
        <div className="absolute top-10 right-12 h-44 w-44 rounded-full bg-amber-400/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-end">
        <div className="space-y-6 lg:max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/80">
            <Sparkles size={14} /> Editorial Studio
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white lg:text-5xl">
              Share elevated insights that guide every relationship
            </h1>
            <p className="text-base leading-relaxed text-white/80">
              Curate stories that illuminate opportunity, empower teams, and
              build trust with clients. Craft premium narratives ready for the
              next investor update or community showcase.
            </p>
          </div>

          {onCreate ? (
            <Button
              type="primary"
              icon={<PenSquare size={18} />}
              size="large"
              onClick={onCreate}
              className="blog-hero__cta"
            >
              Compose new article
            </Button>
          ) : null}
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:max-w-md">
          <StatCard
            title="Published"
            value={summary.published}
            icon={<GalleryVertical size={20} />}
            accent="primary"
          />
          <StatCard
            title="Drafts"
            value={summary.drafts}
            icon={<Users size={20} />}
            accent="amber"
          />
          <StatCard
            title="Total"
            value={summary.total}
            icon={<Sparkles size={20} />}
            accent="emerald"
          />
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
