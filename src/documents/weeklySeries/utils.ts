import type { WeeklySeries, WeeklySeriesEntry } from "./types";

export const extractWeeklySeries = (data: unknown): WeeklySeries[] => {
  if (Array.isArray(data)) return data as WeeklySeries[];
  const typed = data as {
    weeklySeries?: WeeklySeries[];
    data?: WeeklySeries[];
    items?: WeeklySeries[];
  };
  return typed?.weeklySeries ?? typed?.data ?? typed?.items ?? [];
};

export const extractWeeklySeriesDetails = (data: unknown): {
  series?: WeeklySeries;
  entries: WeeklySeriesEntry[];
} => {
  const typed = data as {
    series?: WeeklySeries;
    weeklySeries?: WeeklySeries;
    entries?: WeeklySeriesEntry[];
    data?: {
      series?: WeeklySeries;
      entries?: WeeklySeriesEntry[];
    };
  };

  const series = typed?.series ?? typed?.weeklySeries ?? typed?.data?.series;
  const entries = typed?.entries ?? typed?.data?.entries ?? [];
  return { series, entries };
};
