import type { StatisticItem } from "../types/statistics";
import { useState } from "react";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const getTrendColor = (change: number): string => {
  if (change > 0) return "text-emerald-600";
  if (change < 0) return "text-red-600";
  return "text-slate-600";
};

export const getTrendIcon = (change: number): "up" | "down" | "neutral" => {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "neutral";
};

export const normalizeStatData = (
  data: StatisticItem[]
): Record<string, StatisticItem> => {
  return data.reduce((acc, item) => {
    acc[item.statistic_title] = item;
    return acc;
  }, {} as Record<string, StatisticItem>);
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

export const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const statusColor = (status?: string) => {
  const value = (status ?? "").toLowerCase();
  if (value === "success") return "green";
  if (value === "failed" || value === "error") return "red";
  if (value === "pending") return "orange";
  return "default";
};




// Custom hook for filtering and sorting activity logs
export const useActivityFilter = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateOrder, setDateOrder] = useState<"latest" | "oldest" | undefined>(
    "latest"
  );

  const handleResetFilters = () => {
    setSearchText("");
    setStatusFilter(undefined);
    setDateOrder("latest");
  };

  return {
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    dateOrder,
    setDateOrder,
    handleResetFilters,
  };
};