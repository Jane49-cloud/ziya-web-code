import type { Cycle, CyclePayload } from "./types";

export const extractCycles = (data: unknown): Cycle[] => {
  if (Array.isArray(data)) return data as Cycle[];
  const typed = data as { cycles?: Cycle[]; data?: Cycle[]; items?: Cycle[] };
  return typed?.cycles ?? typed?.data ?? typed?.items ?? [];
};

export const getCycleKey = (cycle: Cycle, index = 0): string => {
  const key =
    cycle.id ?? cycle._id ?? cycle.cycle_number ?? cycle.title ?? index;
  return String(key);
};

export const buildCyclePayload = (values: CyclePayload): CyclePayload =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== "")
  ) as CyclePayload;
