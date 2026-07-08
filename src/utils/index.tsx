/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserProfile } from "../profile/pages";

export const getUser = (): UserProfile | null => {
  const user = localStorage.getItem("ziya-profile");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as UserProfile;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return null;
  }
};

// export const normalizeRole = (role: string | null | undefined): string => {
//   if (!role) return "";
//   return role.trim().toLowerCase();
// };

//new normalizeRole
const ROLE_ID_TO_NAME: Record<number, string> = {
  1: "admin",
  2: "manager",
  3: "staff",
  4: "dev",
  5: "finance",
  6: "support",
  7: "partner-staff",
  8: "customer",
  9: "group-admin",
  10: "partner-chairman",
};

export const normalizeRole = (role: unknown): string => {
  if (role === null || role === undefined || role === "") return "";

  // id: 1, name: "admin"
  if (typeof role === "object") {
    const roleObj = role as {
      id?: number;
      name?: string;
      role?: string | number;
      role_id?: number;
    };

    if (roleObj.name) return roleObj.name.trim().toLowerCase();
    if (roleObj.role) return normalizeRole(roleObj.role);
    if (roleObj.role_id) return normalizeRole(roleObj.role_id);
    if (roleObj.id) return ROLE_ID_TO_NAME[roleObj.id] ?? "";
  }

  //number: 1
  if (typeof role === "number") {
    return ROLE_ID_TO_NAME[role] ?? "";
  }

  // string: "1" or "admin"
  if (typeof role === "string") {
    const cleaned = role.trim().toLowerCase();

    if (/^\d+$/.test(cleaned)) {
      return ROLE_ID_TO_NAME[Number(cleaned)] ?? "";
    }

    return cleaned;
  }

  return "";
};

// export const getRole = (): string | null => {
//   const role = localStorage.getItem("ziya-role");
//   if (!role) return null;
//   return normalizeRole(role) || null;
// };


//new getrole with ID 
export const getRole = (): string | null => {
  const storedRole = localStorage.getItem("ziya-role");

  if (storedRole) {
    const normalized = normalizeRole(storedRole);
    if (normalized) return normalized;
  }

  const user = getUser() as any;

  const roleFromUser =
    user?.userRole?.name ??
    user?.role?.name ??
    user?.role_id ??
    user?.roleId ??
    user?.role ??
    user?.staffData?.role ??
    null;

  const normalized = normalizeRole(roleFromUser);

  if (normalized) {
    localStorage.setItem("ziya-role", normalized);
    return normalized;
  }

  return null;
};



export const formatName = (value?: string | null): string => {
  if (!value) return "";
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) =>
      `${segment.charAt(0).toUpperCase()}${segment.slice(1).toLowerCase()}`
    )
    .join(" ");
};

export const getInitials = (name: string) => {
  const normalized = formatName(name);
  if (!normalized) {
    return "N/A";
  }
  return normalized
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export const customAvatar = (name: string) => (
  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
    {getInitials(name)}
  </div>
);

export const clearZiyaSession = () => {
  if (typeof window === "undefined") return;
  const keys = ["ziya-access", "ziya-profile", "ziya-role"];
  keys.forEach((key) => localStorage.removeItem(key));
};

const LOGOUT_NOTICE_KEY = "ziya-logout-message";

export const triggerLogoutNotice = (
  message = "You have been logged out"
) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LOGOUT_NOTICE_KEY, message);
};

export const consumeLogoutNotice = (): string | null => {
  if (typeof window === "undefined") return null;
  const message = sessionStorage.getItem(LOGOUT_NOTICE_KEY);
  if (message) {
    sessionStorage.removeItem(LOGOUT_NOTICE_KEY);
    return message;
  }
  return null;
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
};

export const formatDateTime = (
  value?: string | null,
  fallback = "—"
): string => {
  if (!value || value.startsWith("0001-01-01")) return fallback;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

export const formatDateTimeWithTime = (
  value?: string | null,
  fallback = "—"
): string => {
  if (!value || value.startsWith("0001-01-01")) return fallback;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(parsed);
};

export const formatCurrency = (
  value: number | string | null | undefined,
  options?: {
    fallback?: string;
    currency?: string;
  }
): string => {
  const { fallback = "—", currency = "KES" } = options ?? {};

  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return fallback;
  }

  return `${currency} ${numeric.toLocaleString()}`;
};

export const formatFullName = (
  firstname?: string | null,
  lastname?: string | null,
  fallback = "—"
): string => {
  const fullName = `${firstname ?? ""} ${lastname ?? ""}`.trim();
  return fullName ? formatName(fullName) : fallback;
};

export const getTypeColor = (type?: string) => {
  const normalized = (type ?? "").toLowerCase();
  if (normalized === "credit") return "green";
  if (normalized === "debit") return "red";
  return "default";
};

export const formatNumber = (
  value: number | string | null | undefined
): number | undefined => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isNaN(numeric) ? undefined : numeric;
};

export const getSubscriptionStanding = (
  arrears?: number | null
): { label: string; color: "red" | "green" | "default" } => {
  if (arrears === null || arrears === undefined) {
    return { label: "Not available", color: "default" };
  }

  return arrears > 0
    ? { label: "In Arrears", color: "red" }
    : { label: "Up to Date", color: "green" };
};

//phone number sanitizing
import type React from "react";

export const PHONE_NUMBER_LENGTH = 10;

export const PHONE_NUMBER_ERROR = "Phone number must be exactly 10 digits.";

export const sanitizePhoneNumber = (value: unknown) => {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, PHONE_NUMBER_LENGTH);
};

export const isValidPhoneNumber = (value: unknown) => {
  return /^\d{10}$/.test(String(value ?? ""));
};

export const phoneNumberInputProps = {
  maxLength: PHONE_NUMBER_LENGTH,
  inputMode: "numeric" as const,
  pattern: "\\d{10}",
  title: PHONE_NUMBER_ERROR,
  onInput: (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = sanitizePhoneNumber(e.currentTarget.value);
  },
};

export const phoneNumberAntdRules = [
  { required: true, message: "Phone number is required!" },
  {
    validator: (_: unknown, value: unknown) => {
      const phoneNumber = String(value ?? "");

      if (!isValidPhoneNumber(phoneNumber)) {
        return Promise.reject(new Error(PHONE_NUMBER_ERROR));
      }

      return Promise.resolve();
    },
  },
];

//search utils

export const lowerInput = (value?: string | number | null): string => {
  return String(value ?? "").toLowerCase();
};

export const cleanLowerInput = (value?: string | number | null): string => {
  return String(value ?? "").trim().toLowerCase();
};