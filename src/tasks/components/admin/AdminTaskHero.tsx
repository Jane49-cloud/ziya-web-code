import React from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock4,
  Plus,
  Sparkles,
} from "lucide-react";

interface AdminTaskHeroProps {
  total: number;
  overdue: number;
  completed: number;
  onCreateTask?: () => void;
}

const heroStats = (total: number, overdue: number, completed: number) => [
  {
    label: "Open workstreams",
    value: total,
    tone: "primary" as const,
    icon: ClipboardList,
  },
  {
    label: "At risk",
    value: overdue,
    tone: "warning" as const,
    icon: Clock4,
  },
  {
    label: "Closed this cycle",
    value: completed,
    tone: "success" as const,
    icon: CheckCircle2,
  },
];

export const AdminTaskHero: React.FC<AdminTaskHeroProps> = ({
  total,
  overdue,
  completed,
  onCreateTask,
}) => {
  const stats = heroStats(total, overdue, completed);

  return (
    <section
      className="
        relative overflow-hidden rounded-3xl border border-slate-800/40
        bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950
        shadow-[0_30px_90px_-40px_rgba(0,0,0,0.6)]
        px-8 py-10 md:px-12 md:py-14
      "
    >
      {/* subtle glows */}
      <div className="pointer-events-none absolute -top-24 -right-32 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-24 h-64 w-64 rounded-full bg-sky-500/30 blur-3xl" />

      <div className="relative flex flex-col items-stretch gap-8 md:flex-row md:items-center md:justify-between">
        {/* Left text block */}
        <div className="min-w-0 text-slate-100">
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-sky-400">
            Operations Dashboard
          </span>

          <h2 className="mt-2 text-2xl font-bold leading-tight text-white md:text-3xl">
            Guide every workstream with clarity
          </h2>

          <p className="mt-2.5 max-w-xl text-sm text-slate-300">
            Coordinate owners, deadlines, and focus areas from one calm,
            intelligent command surface.
          </p>

          {onCreateTask && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onCreateTask}
                className="
                  inline-flex items-center gap-2 rounded-full
                  bg-gradient-to-r from-sky-500 to-blue-600
                  px-6 py-2.5 text-sm font-medium text-white shadow-sm
                  transition hover:from-sky-600 hover:to-blue-700
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
                "
              >
                <Plus size={16} />
                New Task
              </button>

              <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                <Sparkles size={16} className="text-amber-400" />
                Launch a brief, assign a lead, stay ahead.
              </span>
            </div>
          )}
        </div>

        {/* Right stats cards */}
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3 md:max-w-xl">
          {stats.map(({ label, value, tone, icon: Icon }) => (
            <article
              key={label}
              className="
                flex items-center justify-between gap-3 rounded-2xl
                border border-slate-700/60 bg-slate-800/60 backdrop-blur-sm
                px-5 py-5 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.4)]
                transition hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)]
              "
            >
              <div className="flex items-center gap-3">
                <span
                  className={[
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg",
                    tone === "primary" && "bg-sky-500/20 text-sky-400",
                    tone === "warning" && "bg-amber-500/20 text-amber-400",
                    tone === "success" && "bg-emerald-500/20 text-emerald-400",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-400">{label}</p>
                  <p className="text-lg font-semibold leading-none text-white">
                    {value}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
