import React from "react";
import { Card, Skeleton } from "antd";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StatisticItem } from "../types/statistics";
import {
  calculateChange,
  getTrendIcon,
  getTrendColor,
  formatRelativeTime,
} from "../utils";

interface StatCardProps {
  stat?: StatisticItem;
  value?: number;
  title: string;
  formatter?: (value: number) => string;
  icon?: React.ReactNode;
  gradient?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  stat,
  value,
  title,
  formatter = (val) => val.toLocaleString(),
  icon,
  gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  loading = false,
}) => {
  if (loading) {
    return (
      <Card className="rounded-xl border border-slate-200 shadow-sm">
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  const displayValue = stat ? stat.current_value : (value ?? 0);
  const change = stat ? calculateChange(stat.current_value, stat.previous_value) : 0;
  const trendIcon = stat ? getTrendIcon(change) : null;
  const trendColor = stat ? getTrendColor(change) : "";

  return (
    <Card
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      bodyStyle={{ padding: 0 }}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.06]"
        style={{ background: gradient }}
      />

      <div className="relative p-5">
        {/* Icon */}
        {icon && (
          <div
            className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
            style={{ background: gradient }}
          >
            {icon}
          </div>
        )}

        {/* Title */}
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          {title}
        </h3>

        {/* Value */}
        <div className="mb-2 text-2xl font-bold text-slate-900">
          {formatter(displayValue)}
        </div>

        {/* Trend and Update Time — only when StatisticItem is provided */}
        {stat && (
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}
            >
              {trendIcon === "up" && <TrendingUp size={14} />}
              {trendIcon === "down" && <TrendingDown size={14} />}
              {trendIcon === "neutral" && <Minus size={14} />}
              <span>
                {change > 0 ? "+" : ""}
                {change.toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {formatRelativeTime(stat.last_update)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
