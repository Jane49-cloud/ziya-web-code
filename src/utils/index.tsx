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

export const normalizeRole = (role: string | null | undefined): string => {
  if (!role) return "";
  return role.trim().toLowerCase();
};

export const getRole = (): string | null => {
  const role = localStorage.getItem("ziya-role");
  if (!role) return null;
  return normalizeRole(role) || null;
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
