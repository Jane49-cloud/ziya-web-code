/* eslint-disable @typescript-eslint/no-explicit-any */

export const getUser = (): any | null => {
  const user = localStorage.getItem("ziya-profile");
  if (user) {
    return JSON.parse(user) as any;
  }
  return null;
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
