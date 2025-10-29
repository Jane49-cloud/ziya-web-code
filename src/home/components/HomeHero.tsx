import {
  ArrowUpRight,
  CalendarDays,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getInitials } from "../../utils";
import { weeklyUpdate } from "../constants";

interface HomeHeroProps {
  firstName: string;
  roleLabel?: string | null;
}

const HomeHero: React.FC<HomeHeroProps> = ({ firstName, roleLabel }) => {
  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, []);

  const hostInitials = useMemo(() => getInitials(weeklyUpdate.host.name), []);

  return (
    <section
      id="home-overview"
      className="relative overflow-hidden rounded-[2.25rem] border border-white/60 bg-white px-6 pb-12 pt-10 text-slate-900 shadow-[0_32px_90px_rgba(15,53,94,0.14)] sm:px-10 lg:px-14"
    >
      <div className="pointer-events-none absolute inset-y-0 right-[-6rem] w-[55%] rounded-l-[4rem] bg-gradient-to-br from-[#32c5f4]/10 via-[#32c5f4]/5 to-transparent blur-0" />
      <div className="pointer-events-none absolute -top-20 left-10 h-56 w-56 rounded-full bg-[#ffe48c]/55 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-4 h-64 w-64 rounded-full bg-[#9ddcff]/45 blur-[110px]" />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#0f2a4a]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#0f2a4a]">
            <CalendarDays className="h-4 w-4 text-[#ecbe1d]" /> {todayLabel}
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-[#0f2a4a] sm:text-5xl lg:text-[3.25rem]">
            Welcome back,{" "}
            <span className="text-[#1b3e6f] capitalize">{firstName}</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#1f3047]/80 sm:text-xl">
            Operate from a calmer command centre. Align squads, surface
            decisions faster, and keep momentum visible across Ziya.
          </p>
          {roleLabel && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#0f2a4a]/10 bg-[#f6fbff] px-5 py-2 text-sm font-medium text-[#0f2a4a]/80 shadow-sm">
              <span className="rounded-full bg-[#32c5f4]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0f2a4a]">
                Role
              </span>
              <span className="capitalize text-[#0f2a4a]">{roleLabel}</span>
            </div>
          )}
        </div>

        <div className="relative flex flex-col gap-6">
          <div className="relative flex flex-col gap-4 rounded-3xl border border-white/60 bg-[#f8fbff] p-6 shadow-inner shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#1f3047]/60">
              Quick actions
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/create-group"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#0f2a4a] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(12,40,72,0.3)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(12,40,72,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a4a]"
              >
                <PlusCircle className="h-5 w-5" /> Create Group
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-[#0f2a4a]/15 bg-white px-5 py-3 text-sm font-semibold text-[#1b3e6f] shadow-[0_12px_28px_rgba(31,73,121,0.12)] transition-transform duration-300 hover:-translate-y-1 hover:bg-[#f1f6ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a4a]"
              >
                <LayoutDashboard className="h-5 w-5" /> Open Dashboard
              </Link>
              <Link
                to="/analysis"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-[#32c5f4]/40 bg-[#32c5f4]/10 px-5 py-3 text-sm font-semibold text-[#0f2a4a] shadow-[0_14px_32px_rgba(50,197,244,0.18)] transition-transform duration-300 hover:-translate-y-1 hover:bg-[#32c5f4]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a4a]"
              >
                <ArrowUpRight className="h-5 w-5" /> View Analytics
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#f0dba3] bg-gradient-to-br from-[#fff9ec] via-[#fff4da] to-white p-6 shadow-[0_18px_40px_rgba(209,162,62,0.22)]">
            <div className="pointer-events-none absolute -top-16 right-[-3rem] h-32 w-32 rounded-full bg-[#ffe8a8]/70 blur-[80px]" />
            <div className="pointer-events-none absolute bottom-[-3rem] left-[-2rem] h-28 w-28 rounded-full bg-[#fff1c8]/60 blur-[75px]" />

            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7a5300]/70">
              Upcoming weekly update
            </p>
            <div className="mt-4 flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f2a4a] text-base font-semibold text-white shadow-[0_12px_28px_rgba(12,40,72,0.25)]">
                {hostInitials}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#7a5300]/70">
                  {weeklyUpdate.session.dateLabel}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-[#0f2a4a]">
                  {weeklyUpdate.session.topic}
                </h3>
                <p className="mt-2 text-sm text-[#1f3047]/70">
                  Hosted by {weeklyUpdate.host.name} · {weeklyUpdate.host.role},{" "}
                  {weeklyUpdate.host.squad}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#7a5300]/70">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f0dba3]/70 bg-white/80 px-3 py-1 text-[#7a5300]">
                {weeklyUpdate.session.timeLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
