import { UserRole, ALL_ROLES, STAFF_ROLES, ADMIN_DEV } from "../utils/roles";

// header
export interface HeaderLink {
  to: string;
  label: string;
  allowedRoles?: UserRole[];
}

export const navLinks = [
  {
    to: "/",
    label: "Home",
    allowedRoles: ALL_ROLES,
  },
  {
    to: "/dashboard",
    label: "Dashboard",
    allowedRoles: ALL_ROLES,
  },
  {
    to: "/profile",
    label: "Profile",
    allowedRoles: ALL_ROLES,
  },
  // { to: "/staff", label: "Staff", allowedRoles: ADMIN_DEV },
  // { to: "/roles", label: "Roles", allowedRoles: ADMIN_DEV },
  // { to: "/tasks", label: "Tasks", allowedRoles: ADMIN_DEV },
  // { to: "/blogs", label: "Blogs", allowedRoles: ADMIN_DEV },
  {
    to: "/customers",
    label: "Customers",
    allowedRoles: ALL_ROLES,
  },
  {
    to: "/groups",
    label: "Groups",
    allowedRoles: ALL_ROLES,
  },
];

// sidebar

interface SidebarItem {
  title: string;
  icon: string;
  path?: string;
  allowedRoles?: string[];
  dropdown?: { title: string; path: string; allowedRoles?: string[] }[];
}

export const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: "graph-up",
    path: "/dashboard",
    allowedRoles: ALL_ROLES,
  },
  {
    title: "Roles",
    icon: "profile-circle",
    path: "/roles",
    allowedRoles: ADMIN_DEV,
  },

  {
    title: "Users",
    icon: "users",
    dropdown: [
      { title: "Staff", path: "/staff", allowedRoles: ADMIN_DEV },
      {
        title: "Customers",
        path: "/customers",
        allowedRoles: STAFF_ROLES,
      },
    ],
  },
  {
    title: "Businesses",
    icon: "shop",
    path: "/businesses",
    allowedRoles: ALL_ROLES,
  },
  {
    title: "Loans",
    icon: "bank",
    dropdown: [
      {
        title: "Categories",
        path: "/loan-categories",
        allowedRoles: ["admin", "dev"],
      },
      {
        title: "Loans List",
        path: "/loans",
        allowedRoles: STAFF_ROLES,
      },
    ],
  },
  {
    title: "Groups",
    icon: "users",
    path: "/groups",
    allowedRoles: STAFF_ROLES,
  },
  {
    title: "Wallets",
    icon: "wallet",
    path: "/wallets",
    allowedRoles: STAFF_ROLES,
  },
  {
    title: "Tasks",
    icon: "check-circle",
    path: "/tasks",
    allowedRoles: ADMIN_DEV,
  },
  {
    title: "Blogs",
    icon: "note-2",
    path: "/blogs",
    allowedRoles: ALL_ROLES,
  },
  {
    title: "Analysis",
    icon: "chart-simple-2",
    path: "/analysis",
    allowedRoles: STAFF_ROLES,
  },
];
