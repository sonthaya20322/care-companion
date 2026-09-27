export type UserRole = "customer" | "companion" | "admin";
export type AccountStatus = "active" | "suspended";

export const roleLabels: Record<UserRole, string> = {
  customer: "ผู้ใช้บริการ",
  companion: "ผู้ช่วยร่วมเดินทาง",
  admin: "ผู้ดูแลระบบ",
};

export const roleHome: Record<UserRole, string> = {
  customer: "/customer",
  companion: "/companion",
  admin: "/admin",
};

/** Where a signed-in user should land: onboarding until a role is chosen. */
export function homePathFor(role: UserRole | null): string {
  return role ? roleHome[role] : "/onboarding";
}

/** Route prefixes that require a specific role. */
export function requiredRoleForPath(pathname: string): UserRole | null {
  for (const role of Object.keys(roleHome) as UserRole[]) {
    const prefix = roleHome[role];
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return role;
  }
  return null;
}
