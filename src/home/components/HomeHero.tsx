import {
  ArrowUpRight,
  CalendarDays,
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Clock,
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
      className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-gradient-to-br from-white via-white to-blue-50/30 px-6 pb-12 pt-10 text-slate-900 shadow-[0_32px_90px_rgba(15,53,94,0.16)] sm:px-10 lg:px-14"
    >
      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-y-0 right-[-6rem] w-[55%] rounded-l-[4rem] bg-gradient-to-br from-[#32c5f4]/15 via-[#32c5f4]/8 to-transparent opacity-80" />
      <div className="pointer-events-none absolute -top-20 left-10 h-64 w-64 rounded-full bg-gradient-to-br from-[#ffe48c]/60 to-[#ffd700]/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-4 h-72 w-72 rounded-full bg-gradient-to-br from-[#9ddcff]/50 to-[#32c5f4]/30 blur-[120px]" />

      {/* Floating particles effect */}
      <div className="pointer-events-none absolute top-20 left-1/4 h-2 w-2 animate-pulse rounded-full bg-[#32c5f4]/40" />
      <div
        className="pointer-events-none absolute top-40 right-1/3 h-1.5 w-1.5 animate-pulse rounded-full bg-[#ecbe1d]/50"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="pointer-events-none absolute bottom-32 left-1/3 h-2 w-2 animate-pulse rounded-full bg-[#9ddcff]/40"
        style={{ animationDelay: "0.5s" }}
      />

      <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:items-center">
        {/* Left Column - Welcome Content */}
        <div className="space-y-6">
          {/* Date Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#0f2a4a]/8 to-[#32c5f4]/8 px-4 py-2 shadow-sm ring-1 ring-[#0f2a4a]/10">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#ecbe1d] to-[#d4a817]">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-[#0f2a4a]">
              {todayLabel}
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-[#0f2a4a] sm:text-5xl lg:text-[3.5rem]">
              Welcome back,{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#1b3e6f] to-[#32c5f4] bg-clip-text text-transparent capitalize">
                  {firstName}
                </span>
                <span className="absolute -bottom-2 left-0 h-3 w-full bg-gradient-to-r from-[#ecbe1d]/30 to-transparent blur-sm" />
              </span>
            </h1>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#ecbe1d]" />
              <p className="text-base font-medium text-[#32c5f4]">
                Your command centre awaits
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="max-w-xl text-lg leading-relaxed text-[#1f3047]/75 sm:text-xl">
            Operate from a calmer command centre. Align squads, surface
            decisions faster, and keep momentum visible across Ziya.
          </p>

          {/* Role Badge */}
          {roleLabel && (
            <div className="inline-flex items-center gap-3 rounded-2xl border border-[#0f2a4a]/15 bg-gradient-to-br from-[#f6fbff] to-white px-6 py-3 shadow-md ring-1 ring-[#0f2a4a]/5">
              <span className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#32c5f4]/15 to-[#32c5f4]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#0f2a4a]">
                <span className="h-2 w-2 rounded-full bg-[#32c5f4]" />
                Role
              </span>
              <span className="text-base font-semibold capitalize text-[#0f2a4a]">
                {roleLabel}
              </span>
            </div>
          )}
        </div>

        {/* Right Column - Action Cards */}
        <div className="relative flex flex-col gap-6">
          {/* Quick Actions Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-[#f8fbff] via-white to-[#f0f7ff] p-7 shadow-lg shadow-blue-500/5 ring-1 ring-[#0f2a4a]/5 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#32c5f4]/10 blur-2xl transition-transform duration-500 group-hover:scale-150" />

            <div className="relative space-y-5">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[#32c5f4]" />
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#1f3047]/60">
                  Quick actions
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/create-group"
                  className="group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f2a4a] to-[#1b3e6f] px-6 py-3.5 text-sm font-bold text-white shadow-[0_20px_45px_rgba(12,40,72,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(12,40,72,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a4a]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Group</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl border border-[#0f2a4a]/20 bg-white px-6 py-3.5 text-sm font-bold text-[#1b3e6f] shadow-[0_12px_28px_rgba(31,73,121,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-[#32c5f4]/40 hover:bg-gradient-to-br hover:from-white hover:to-[#f1f6ff] hover:shadow-[0_16px_36px_rgba(31,73,121,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a4a]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#32c5f4]/10 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Open Dashboard</span>
                </Link>

                <Link
                  to="/analysis"
                  className="group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl border border-[#32c5f4]/30 bg-gradient-to-br from-[#32c5f4]/15 to-[#32c5f4]/5 px-6 py-3.5 text-sm font-bold text-[#0f2a4a] shadow-[0_14px_32px_rgba(50,197,244,0.22)] transition-all duration-300 hover:-translate-y-1 hover:from-[#32c5f4]/25 hover:to-[#32c5f4]/10 hover:shadow-[0_18px_40px_rgba(50,197,244,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a4a]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  <ArrowUpRight className="h-5 w-5" />
                  <span>View Analytics</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Weekly Update Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#f0dba3] bg-gradient-to-br from-[#fff9ec] via-[#fff4da] to-[#fffbf0] p-7 shadow-xl shadow-amber-500/15 ring-1 ring-[#ecbe1d]/20 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/25">
            {/* Enhanced Background Effects */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-[#ffe8a8]/80 to-[#ffd700]/60 blur-[90px] transition-transform duration-500 group-hover:scale-125" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-gradient-to-br from-[#fff1c8]/70 to-[#ffe48c]/50 blur-[85px]" />

            <div className="relative space-y-5">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#ecbe1d] to-[#d4a817]">
                  <Clock className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#7a5300]/75">
                  Upcoming weekly update
                </p>
              </div>

              <div className="flex items-start gap-5">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#ecbe1d]/40 to-[#d4a817]/40 blur-lg" />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2a4a] to-[#1b3e6f] text-lg font-bold text-white shadow-lg">
                    {hostInitials}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#7a5300]/75">
                      {weeklyUpdate.session.dateLabel}
                    </p>
                    <h3 className="text-xl font-bold text-[#0f2a4a]">
                      {weeklyUpdate.session.topic}
                    </h3>
                  </div>

                  <p className="text-sm leading-relaxed text-[#1f3047]/70">
                    Hosted by{" "}
                    <span className="font-semibold text-[#0f2a4a]">
                      {weeklyUpdate.host.name}
                    </span>{" "}
                    · {weeklyUpdate.host.role}, {weeklyUpdate.host.squad}
                  </p>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-[#f0dba3]/80 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#7a5300] shadow-sm backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5" />
                    {weeklyUpdate.session.timeLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
