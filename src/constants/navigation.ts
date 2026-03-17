import { OrgRole, SystemRole, type OrgRole as OrgRoleType, type SystemRole as SystemRoleType } from "./roles";

export interface NavItem {
  to: string;
  label: string;
  requiredOrgRoles?: OrgRoleType[];
  requiredSystemRole?: SystemRoleType;
}

export const navItems: NavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/inventory", label: "Inventory" },
  { to: "/store-layout", label: "Store layout" },
  { to: "/analytics", label: "Analytics" },
  { to: "/suppliers", label: "Suppliers" },
  {
    to: "/org-settings",
    label: "Organization",
    requiredOrgRoles: [OrgRole.OWNER, OrgRole.ADMIN],
  },
  {
    to: "/admin",
    label: "System Admin",
    requiredSystemRole: SystemRole.ADMIN,
  },
];
