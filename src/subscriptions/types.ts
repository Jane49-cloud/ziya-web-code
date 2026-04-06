export type SubscriptionRecord = Record<string, unknown>;

export type SubscriptionApiResponse = {
  message?: string;
  subscriptions?: SubscriptionRecord[];
  revenues?: SubscriptionRecord[];
  revenue?: SubscriptionRecord[];
  data?: SubscriptionRecord[] | SubscriptionRecord;
  items?: SubscriptionRecord[];
  results?: SubscriptionRecord[];
  group?: SubscriptionRecord;
  [key: string]: unknown;
};

export const normalizeSubscriptionCollection = (
  payload?: SubscriptionApiResponse | SubscriptionRecord[] | null,
): SubscriptionRecord[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload.subscriptions,
    payload.revenues,
    payload.revenue,
    payload.items,
    payload.results,
    Array.isArray(payload.data) ? payload.data : undefined,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

export const normalizeSubscriptionEntity = (
  payload?: SubscriptionApiResponse | SubscriptionRecord | null,
): SubscriptionRecord | null => {
  if (!payload) return null;
  if ("group" in payload && payload.group && typeof payload.group === "object") {
    return payload.group as SubscriptionRecord;
  }
  if ("data" in payload && payload.data && !Array.isArray(payload.data)) {
    return payload.data as SubscriptionRecord;
  }
  return payload as SubscriptionRecord;
};

export const toCurrency = (value: unknown) => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return "KES 0";
  return `KES ${amount.toLocaleString()}`;
};

export const toNumber = (value: unknown) => {
  const amount = Number(value ?? 0);
  return Number.isNaN(amount) ? 0 : amount;
};

export const toDisplayText = (value: unknown, fallback = "—") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

export const toDateText = (value: unknown) => {
  if (!value) return "—";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString();
};
