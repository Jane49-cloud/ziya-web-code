import {
  UserRole,
  ALL_ROLES,
  STAFF_ROLES,
  ADMIN_DEV,
  STAFF_MANAGEMENT_ROLES,
} from "../utils/roles";

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
  {
    to: "/subscriptions",
    label: "Subscriptions",
    allowedRoles: STAFF_ROLES,
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
      { title: "Staff", path: "/staff", allowedRoles: STAFF_MANAGEMENT_ROLES },
      {
        title: "Customers",
        path: "/customers",
        allowedRoles: STAFF_ROLES,
      },
    ],
  },
  // {
  //   title: "Businesses",
  //   icon: "shop",
  //   path: "/businesses",
  //   allowedRoles: ALL_ROLES,
  // },
  {
    title: "Loans",
    icon: "dollar",
    dropdown: [
      {
        //title: "Categories",
        title: "Loan Types",
        path: "/loan-types",
        allowedRoles: ["admin", "dev"],
      },
      {
        title: "Loans List",
        path: "/loans",
        allowedRoles: STAFF_ROLES,
      },
      {
        title: "Cycles",
        path: "/loan-cycles",
        allowedRoles: STAFF_ROLES,
      },
      //new loan category
      {
        title: "Loan Categories",
        path: "/loan-categories",
        allowedRoles: ["admin", "dev", "support"],
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
    title: "Subscriptions",
    icon: "bill",
    path: "/subscriptions",
    allowedRoles: STAFF_ROLES,
  },

  {
    title: "Wallets",
    icon: "wallet",
    dropdown: [
      {
        title: "Group Wallets",
        path: "/wallets/group",
        allowedRoles: STAFF_ROLES,
      },
      {
        title: "Personal Wallets",
        path: "/wallets/personal",
        allowedRoles: STAFF_ROLES,
      },
      {
        title: "Partner Wallets",
        path: "/wallets/partners",
        allowedRoles: ADMIN_DEV,
      },
    ],
  },

  {
    title: "Transactions",
    icon: "arrows-circle",
    dropdown: [
      {
        title: "Group Transactions",
        path: "/transactions/group",
        allowedRoles: STAFF_ROLES,
      },
      {
        title: "Personal Transactions",
        path: "/transactions/personal",
        allowedRoles: STAFF_ROLES,
      },
    ],
  },
  {
    title: "Partners",
    // icon: "chart-line",
    icon: "bank",
    path: "/sacco",
    allowedRoles: ["admin", "dev"],
  },
  {
    title: "Assets",
    icon:"package",
    path: "/loan-assets",
    allowedRoles: ["admin", "dev", "support"],
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
    title: "Documents",
    icon: "document",
    path: "/documents",
    allowedRoles: ALL_ROLES,
  },
  {
    title: "Analysis",
    icon: "chart-simple-2",
    path: "/analysis",
    allowedRoles: STAFF_ROLES,
  },

  // visualization
  // {
  //   title: "Visualizations",
  //   icon: "chart-line",
  //   path: "/visualizations",
  //   allowedRoles: ADMIN_DEV,
  // },

   //assets module
      
];
