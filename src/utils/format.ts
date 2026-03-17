export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

export function formatRoleLabel(role: string | null | undefined): string {
  if (!role) {
    return "member";
  }

  return role
    .replace("ORG_", "")
    .replace("SYSTEM_", "")
    .toLowerCase();
}
