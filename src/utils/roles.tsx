export type UserRole =
  | "admin"
  | "dev"
  | "relationship-manager"
  | "guest"
  | "staff"
  | "support"
  | "finance";

export function canAccess(
  allowedRoles: UserRole[] | undefined,
  userRole: UserRole | null
): boolean {
  if (!allowedRoles) return true;
  return userRole ? allowedRoles.includes(userRole) : false;
}

export const ALL_ROLES: UserRole[] = [
  "admin",
  "dev",
  "relationship-manager",
  "staff",
  "support",
  "guest",
  "finance",
];

export const STAFF_ROLES: UserRole[] = [
  "admin",
  "dev",
  "relationship-manager",
  "staff",
  "support",
  "finance",
];

export const ADMIN_DEV: UserRole[] = ["admin", "dev"];
export const STAFF_MANAGEMENT_ROLES: UserRole[] = ["admin", "dev", "support"];

export const ADMIN_DEV_FINANCE: UserRole[] = ["admin", "dev", "finance"];
