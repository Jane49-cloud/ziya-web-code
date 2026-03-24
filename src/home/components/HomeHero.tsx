import {
  ArrowUpRight,
  CalendarDays,
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Button, Form, Input, Modal, DatePicker } from "antd";
import { formatName, getInitials, getRole } from "../../utils";
import {
  WEEKLY_UPDATE_STORAGE_KEY,
  weeklyUpdate as defaultWeeklyUpdate,
  WeeklyUpdateConfig,
} from "../constants";

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

  const [weeklyDetails, setWeeklyDetails] = useState<WeeklyUpdateConfig>(() => {
    if (typeof window === "undefined") return defaultWeeklyUpdate;
    try {
      const stored = localStorage.getItem(WEEKLY_UPDATE_STORAGE_KEY);
      if (!stored) return defaultWeeklyUpdate;
      const parsed = JSON.parse(stored) as WeeklyUpdateConfig;
      return {
        host: {
          name: formatName(parsed.host?.name) || defaultWeeklyUpdate.host.name,
          role: parsed.host?.role || defaultWeeklyUpdate.host.role,
          squad: parsed.host?.squad || defaultWeeklyUpdate.host.squad,
        },
        session: {
          topic: parsed.session?.topic || defaultWeeklyUpdate.session.topic,
          dateISO:
            parsed.session?.dateISO || defaultWeeklyUpdate.session.dateISO,
          timeLabel:
            parsed.session?.timeLabel || defaultWeeklyUpdate.session.timeLabel,
        },
      };
    } catch (err) {
      console.warn("Failed to parse weekly update", err);
      return defaultWeeklyUpdate;
    }
  });

  useEffect(() => {
    const stored = localStorage.getItem(WEEKLY_UPDATE_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(
        WEEKLY_UPDATE_STORAGE_KEY,
        JSON.stringify(defaultWeeklyUpdate)
      );
    }
  }, []);

  const sessionDateLabel = useMemo(() => {
    try {
      if (!weeklyDetails.session.dateISO) {
        return new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).format(new Date());
      }
      const dateValue = new Date(weeklyDetails.session.dateISO);
      if (Number.isNaN(dateValue.getTime())) {
        return weeklyDetails.session.dateISO;
      }
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(dateValue);
    } catch (error) {
      return weeklyDetails.session.dateISO;
    }
  }, [weeklyDetails.session.dateISO]);

  const hostInitials = useMemo(
    () => getInitials(weeklyDetails.host.name),
    [weeklyDetails.host.name]
  );

  const role = getRole();
  const canEditWeekly = role === "admin" || role === "dev";
  const [isWeeklyEditorOpen, setWeeklyEditorOpen] = useState(false);
  const [weeklyForm] = Form.useForm();

  const openWeeklyEditor = () => {
    weeklyForm.setFieldsValue({
      hostName: weeklyDetails.host.name,
      hostRole: weeklyDetails.host.role,
      hostSquad: weeklyDetails.host.squad,
      topic: weeklyDetails.session.topic,
      date: weeklyDetails.session.dateISO
        ? dayjs(weeklyDetails.session.dateISO)
        : null,
      timeLabel: weeklyDetails.session.timeLabel,
    });
    setWeeklyEditorOpen(true);
  };

  const handleWeeklySave = async () => {
    const values = await weeklyForm.validateFields();
    const next: WeeklyUpdateConfig = {
      host: {
        name: formatName(values.hostName),
        role: values.hostRole,
        squad: values.hostSquad,
      },
      session: {
        topic: values.topic,
        dateISO: values.date
          ? values.date.toDate().toISOString()
          : weeklyDetails.session.dateISO,
        timeLabel: values.timeLabel,
      },
    };
    setWeeklyDetails(next);
    localStorage.setItem(WEEKLY_UPDATE_STORAGE_KEY, JSON.stringify(next));
    setWeeklyEditorOpen(false);
  };

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
                  to="/documents"
                  className="group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f2a4a] to-[#1b3e6f] px-6 py-3.5 text-sm font-bold text-white shadow-[0_20px_45px_rgba(12,40,72,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(12,40,72,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2a4a]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  <PlusCircle className="h-5 w-5" />
                  <span>Open documents</span>
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
          <div className="group relative overflow-hidden rounded-3xl border border-[#f0dba3] bg-gradient-to-br from-[#fff9ec] via-[#fff4da] to-[#fffbf0] p-6 shadow-xl shadow-amber-500/15 ring-1 ring-[#ecbe1d]/20 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/25">
            {/* Background gradient circles */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#ffe8a8]/80 to-[#ffd700]/60 blur-[90px] transition-transform duration-500 group-hover:scale-110" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-gradient-to-br from-[#fff1c8]/70 to-[#ffe48c]/50 blur-[85px]" />

            <div className="relative flex flex-col gap-4">
              {/* Header Section */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ecbe1d] to-[#d4a817]">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7a5300]/75">
                      Weekly Series
                    </p>
                    <p className="text-sm font-semibold text-[#0f2a4a]">
                      A Monday vignette from the team
                    </p>
                  </div>
                </div>
                {canEditWeekly && (
                  <Button size="small" onClick={openWeeklyEditor}>
                    Update
                  </Button>
                )}
              </div>

              {/* Host and session details */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#ecbe1d]/40 to-[#d4a817]/40 blur-md" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2a4a] to-[#1b3e6f] text-lg font-bold text-white shadow-lg">
                    {hostInitials}
                  </span>
                </div>
                <div className="flex flex-col text-sm">
                  <p className="text-[#7a5300]/80">{sessionDateLabel}</p>
                  <p className="font-semibold text-[#0f2a4a]">
                    {weeklyDetails.host.name}
                  </p>
                  <p className="text-xs text-[#1f3047]/70">
                    {weeklyDetails.host.role} · {weeklyDetails.host.squad}
                  </p>
                </div>
              </div>
              <div className="flex-1 text-sm text-[#1f3047]/80">
                {weeklyDetails.session.topic}
              </div>

              {/* Session Details */}
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#7a5300]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ecbe1d]/60 bg-[#fff7e5] px-3 py-1 shadow-sm">
                  <Clock className="h-3 w-3" />
                  {weeklyDetails.session.timeLabel}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#0f2a4a]/10 bg-white/80 px-3 py-1 shadow-sm text-[#0f2a4a]">
                  Rotates weekly
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Update Weekly Story"
        open={isWeeklyEditorOpen}
        onCancel={() => setWeeklyEditorOpen(false)}
        onOk={handleWeeklySave}
        okText="Save"
      >
        <Form layout="vertical" form={weeklyForm}>
          <Form.Item
            label="Host Name"
            name="hostName"
            rules={[{ required: true, message: "Enter host name" }]}
          >
            <Input placeholder="Fatma Hassan" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="hostRole"
            rules={[{ required: true, message: "Enter host role" }]}
          >
            <Input placeholder="Culture & Community Lead" />
          </Form.Item>
          <Form.Item
            label="Squad"
            name="hostSquad"
            rules={[{ required: true, message: "Enter squad" }]}
          >
            <Input placeholder="People Lab" />
          </Form.Item>
          <Form.Item
            label="Update Theme"
            name="topic"
            rules={[{ required: true, message: "Enter topic" }]}
          >
            <Input placeholder="Stories that shape our lending rituals" />
          </Form.Item>
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Pick a date" }]}
          >
            <DatePicker className="w-full" format="dddd, MMMM D" />
          </Form.Item>
          <Form.Item
            label="Time"
            name="timeLabel"
            rules={[{ required: true, message: "Provide time" }]}
          >
            <Input placeholder="11:00 AM EAT" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
};

export default HomeHero;
