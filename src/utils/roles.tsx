export type UserRole =
  | "admin"
  | "dev"
  | "relationship-manager"
  | "guest"
  | "staff";

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
  "guest",
];
export const STAFF_ROLES: UserRole[] = [
  "admin",
  "dev",
  "relationship-manager",
  "staff",
];
export const ADMIN_DEV: UserRole[] = ["admin", "dev"];
