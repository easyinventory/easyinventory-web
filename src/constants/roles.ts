export const SystemRole = {
  ADMIN: "SYSTEM_ADMIN",
} as const;

export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole];

export const OrgRole = {
  OWNER: "ORG_OWNER",
  ADMIN: "ORG_ADMIN",
  EMPLOYEE: "ORG_EMPLOYEE",
  VIEWER: "ORG_VIEWER",
} as const;

export type OrgRole = (typeof OrgRole)[keyof typeof OrgRole];

export function isOrgOwner(role: OrgRole | string | null | undefined): boolean {
  return role === OrgRole.OWNER;
}

export function isOrgAdmin(role: OrgRole | string | null | undefined): boolean {
  return role === OrgRole.OWNER || role === OrgRole.ADMIN;
}

export function canManageMembers(role: OrgRole | string | null | undefined): boolean {
  return isOrgAdmin(role);
}

export function formatRoleLabel(role: OrgRole | SystemRole | string | null | undefined): string {
  if (!role) {
    return "member";
  }

  return role
    .replace("ORG_", "")
    .replace("SYSTEM_", "")
    .toLowerCase();
}
