import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { HomeCardAccent } from "../constants";

interface HomeCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  accent: HomeCardAccent;
  to?: string;
  badge?: string;
  layout?: "standard" | "banner";
}

const accentTokens: Record<
  HomeCardAccent,
  {
    stripe: string;
    surface: string;
    border: string;
    iconBg: string;
    badge: string;
    hover: string;
    bubble: string;
    bubbleAlt: string;
    textMuted: string;
    textBody: string;
  }
> = {
  sky: {
    stripe: "from-[#5ed6ff] via-[#32c5f4] to-[#8ddffb]",
    surface: "bg-gradient-to-br from-white via-[#f4fbff] to-white",
    border: "border border-[#dcebfa]",
    iconBg: "bg-[#32c5f4]/12 text-[#0f2a4a]",
    badge: "bg-[#e3f5ff] text-[#0d3a5f]",
    hover: "hover:shadow-[0_22px_44px_rgba(50,197,244,0.18)]",
    bubble: "bg-[#32c5f4]/18",
    bubbleAlt: "bg-[#ffe38f]/25",
    textMuted: "text-[#1f3047]/58",
    textBody: "text-[#1f3047]/80",
  },
  sun: {
    stripe: "from-[#ffd861] via-[#ffc94a] to-[#ffe38f]",
    surface: "bg-gradient-to-br from-white via-[#fff7e2] to-[#fff4d0]",
    border: "border border-[#f6e1a4]",
    iconBg: "bg-[#ffda6a]/20 text-[#7a5300]",
    badge: "bg-[#fff3c2] text-[#7a5300]",
    hover: "hover:shadow-[0_22px_44px_rgba(255,202,80,0.28)]",
    bubble: "bg-[#ffe38f]/35",
    bubbleAlt: "bg-[#32c5f4]/20",
    textMuted: "text-[#705000]/60",
    textBody: "text-[#5b3a00]/78",
  },
  navy: {
    stripe: "from-[#1f3e63] via-[#133352] to-[#3a5a80]",
    surface: "bg-gradient-to-br from-[#162f4a] via-[#14263d] to-[#1c3552] text-white",
    border: "border border-[#1d3654]",
    iconBg: "bg-[#133352]/35 text-white",
    badge: "bg-white/10 text-white",
    hover: "hover:shadow-[0_24px_46px_rgba(19,51,82,0.32)]",
    bubble: "bg-[#32c5f4]/20",
    bubbleAlt: "bg-[#ffe38f]/25",
    textMuted: "text-white/65",
    textBody: "text-white/85",
  },
  neutral: {
    stripe: "from-[#e7eef6] via-[#f2f6fb] to-[#fff7df]",
    surface: "bg-gradient-to-br from-white via-[#f6f9fe] to-white",
    border: "border border-[#e0e7f2]",
    iconBg: "bg-[#eff4fb] text-[#1c273a]",
    badge: "bg-[#f2f4f8] text-[#1c273a]",
    hover: "hover:shadow-[0_22px_44px_rgba(145,164,192,0.18)]",
    bubble: "bg-[#32c5f4]/15",
    bubbleAlt: "bg-[#ffe38f]/20",
    textMuted: "text-[#1f3047]/55",
    textBody: "text-[#1f3047]/75",
  },
};

export const HomeCard: React.FC<HomeCardProps> = ({
  title,
  subtitle,
  description,
  icon: Icon,
  accent,
  to,
  badge,
  layout = "standard",
}) => {
  const isInteractive = Boolean(to);
  const tokens = accentTokens[accent];
  const ctaLabel = isInteractive ? "Explore" : "Stay tuned";

  const card = (
    <div
      className={clsx(
        "relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-300",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#32c5f4]",
        layout === "banner" ? "md:p-8" : "",
        tokens.surface,
        tokens.border,
        isInteractive ? tokens.hover : "cursor-default"
      )}
    >
      <div
        className={clsx(
          "pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r",
          tokens.stripe
        )}
      />

      <div
        className={clsx(
          "pointer-events-none absolute -top-10 right-6 h-24 w-24 rounded-full blur-3xl",
          tokens.bubble
        )}
      />
      <div
        className={clsx(
          "pointer-events-none absolute -bottom-14 -left-8 h-24 w-24 rounded-full blur-3xl",
          tokens.bubbleAlt
        )}
      />

      {badge && (
        <span
          className={clsx(
            "inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.32em]",
            tokens.badge
          )}
        >
          {badge}
        </span>
      )}

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className={clsx("text-xs font-semibold uppercase tracking-[0.32em]", tokens.textMuted)}>
            {subtitle}
          </p>
          <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h3>
        </div>
        <span
          className={clsx(
            "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border backdrop-blur",
            tokens.iconBg,
            accent === "navy" ? "border-white/20" : "border-white/80"
          )}
        >
          <Icon className="h-7 w-7" />
        </span>
      </div>

      <p className={clsx("mt-5 max-w-[38ch] text-base leading-relaxed", tokens.textBody)}>
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-semibold">
        <span
          className={clsx(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 uppercase tracking-[0.28em] transition-colors",
            accent === "navy"
              ? "border-white/25 bg-white/10 text-white"
              : "border-[#e0e5ef] bg-[#f7f9fc] text-[#1f3047]"
          )}
        >
          {ctaLabel}
          {isInteractive && (
            <svg
              className="h-3 w-3"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 4h6M5 2l2 2-2 2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className={clsx("text-xs uppercase tracking-[0.34em]", tokens.textMuted)}>
          Smooth transitions
        </span>
      </div>
    </div>
  );

  if (!isInteractive) {
    return <div className="h-full">{card}</div>;
  }

  return (
    <Link to={to ?? "#"} className="h-full focus:outline-none">
      {card}
    </Link>
  );
};

export default HomeCard;
