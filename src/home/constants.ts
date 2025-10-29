import type { LucideIcon } from "lucide-react";
import {
  BarChart4,
  Briefcase,
  FileBarChart2,
  HeartHandshake,
  Megaphone,
  Users2,
  Wallet2,
} from "lucide-react";

export type HomeCardAccent = "sky" | "sun" | "navy" | "neutral";

export interface HomeCardConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  to?: string;
  accent: HomeCardAccent;
  layout?: "standard" | "banner";
  badge?: string;
}

export const homeCards: HomeCardConfig[] = [
  {
    id: "groups-wallets",
    title: "Groups & Wallets",
    subtitle: "Collective Capital",
    description:
      "Monitor group balances, wallet health, and set smart contribution goals in real time.",
    icon: Users2,
    to: "/groups",
    accent: "sky",
    badge: "Core",
  },
  {
    id: "reports",
    title: "Reports",
    subtitle: "Weekly Snapshots",
    description:
      "Export curated insights and share tailored summaries with leadership in a single tap.",
    icon: FileBarChart2,
    to: "/analysis",
    accent: "sun",
    badge: "Insights",
  },
  {
    id: "hiring-hub",
    title: "Hiring Hub",
    subtitle: "Talent Radar",
    description:
      "Surface the strongest candidates, manage interviews, and fast-track onboarding workflows.",
    icon: Briefcase,
    to: "/staff",
    accent: "navy",
    badge: "People",
  },
  {
    id: "company-updates",
    title: "Company Updates",
    subtitle: "All Hands",
    description:
      "Stay synced with rolling announcements, policy refreshers, and upcoming milestones.",
    icon: Megaphone,
    accent: "neutral",
    badge: "Communications",
  },
  {
    id: "analytics",
    title: "Analytics",
    subtitle: "Momentum",
    description:
      "Track performance indicators, uncover trends, and make decisions with confidence.",
    icon: BarChart4,
    to: "/analysis",
    accent: "sky",
    badge: "Data",
  },
  {
    id: "my-ziya",
    title: "My Ziya",
    subtitle: "Personal HQ",
    description:
      "Curate shortcuts, automate routines, and keep your favourite dashboards within reach.",
    icon: Wallet2,
    to: "/profile",
    accent: "sun",
    badge: "You",
  },
  {
    id: "our-culture",
    title: "Our Culture",
    subtitle: "Built Together",
    description:
      "Celebrate team stories, recognise wins, and explore the values guiding every product decision.",
    icon: HeartHandshake,
    accent: "navy",
    badge: "Pulse",
    layout: "banner",
  },
];

export const weeklyUpdate = {
  host: {
    name: "Jane Ndirangu",
    role: "Software Engineer",
    squad: "Tech team and support",
  },
  session: {
    topic: "Unlocking wallet rituals across emerging cohorts",
    dateLabel: "Monday, 27 January",
    timeLabel: "11:00 AM WAT",
    location: "Momentum Studio",
  },
};

export const pulseHighlights = {
  spotlight: {
    title: "Growth Sprint Week",
    description:
      "Product, growth, and customer teams are syncing twice daily to ship the new lending analytics bundle.",
    ctaLabel: "View agenda",
    to: "/analysis",
  },
  metrics: [
    {
      id: "loan-velocity",
      label: "Loan velocity",
      value: "+18%",
      trend: "up",
      caption: "compared to last quarter",
    },
    {
      id: "active-groups",
      label: "Active groups",
      value: "312",
      trend: "steady",
      caption: "reporting weekly health checks",
    },
    {
      id: "customer-nps",
      label: "Customer NPS",
      value: "67",
      trend: "up",
      caption: "new high for the year",
    },
  ],
  sparks: [
    {
      id: "playbook",
      title: "Scaling Playbook",
      description:
        "Resource hub updated with retention experiments and messaging templates.",
    },
    {
      id: "wellness",
      title: "Wellness Studio",
      description:
        "Friday restore session hosted by the culture crew — RSVP by Thursday noon.",
    },
    {
      id: "recognition",
      title: "Spotlight",
      description:
        "Celebrate Amina for orchestrating the cross-pod payments retro this week.",
    },
  ],
};
