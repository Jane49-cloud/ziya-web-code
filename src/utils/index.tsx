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

export const getRole = (): any | null => {
  const role = localStorage.getItem("ziya-role");

  if (!role) {
    return null;
  }

  try {
    return JSON.parse(role) as any;
  } catch (error) {
    console.error("Error parsing user role from localStorage:", error);
    return null;
  }
};

export const getInitials = (name: string) => {
  if (!name) {
    return "N/A";
  }
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export const customAvatar = (name: string) => (
  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
    {getInitials(name)}
  </div>
);

export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
};
