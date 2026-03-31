import type { ReactNode } from "react";
import { OrgRole, SystemRole, type OrgRole as OrgRoleType, type SystemRole as SystemRoleType } from "./roles";
import {
  IconDashboard,
  IconProducts,
  IconInventory,
  IconSuppliers,
  IconStoreLayout,
  IconAnalytics,
  IconOrganization,
  IconAdmin,
} from "./nav-icons";

/* ═══════════════════════════════════════════════════════
   Navigation — Single source of truth for all nav items.
   Controls sidebar order, dashboard cards, disabled state,
   icons, and role-based visibility.
   ═══════════════════════════════════════════════════════ */

export interface NavItem {
  /** Unique key used for CSS class modifiers (e.g. dashboard-card__icon--products) */
  key: string;
  /** Route path */
  to: string;
  /** Display label in sidebar & card title */
  label: string;
  /** Short description shown on dashboard cards */
  description: string;
  /** CTA button text on dashboard cards */
  ctaLabel: string;
  /** Icon component (renders responsive SVG — parent controls size) */
  icon: ReactNode;
  /** When true, item shows as greyed-out / "coming soon" */
  disabled?: boolean;
  /** If set, only visible to users with one of these org roles */
  requiredOrgRoles?: OrgRoleType[];
  /** If set, only visible to users with this system role */
  requiredSystemRole?: SystemRoleType;
  /** If true, this item is not shown as a dashboard card (e.g. Dashboard itself) */
  hideFromDashboard?: boolean;
}

/* ── Navigation items (single source of truth) ───────── */

export const navItems: NavItem[] = [
  {
    key: "dashboard",
    to: "/",
    label: "Dashboard",
    description: "",
    ctaLabel: "",
    icon: <IconDashboard />,
    hideFromDashboard: true,
  },
  {
    key: "products",
    to: "/products",
    label: "Products",
    description: "Browse, create, and manage your product catalog with supplier linking.",
    ctaLabel: "Go to Products",
    icon: <IconProducts />,
  },
  {
    key: "suppliers",
    to: "/suppliers",
    label: "Suppliers",
    description: "Manage supplier contacts and link them to products for easy ordering.",
    ctaLabel: "Go to Suppliers",
    icon: <IconSuppliers />,
  },
  {
    key: "inventory",
    to: "/inventory",
    label: "Inventory",
    description: "Track stock levels, log adjustments, and receive low-stock alerts.",
    ctaLabel: "Go to Inventory",
    icon: <IconInventory />,
  },
  {
    key: "store-layout",
    to: "/store-layout",
    label: "Store Layout",
    description: "Design and visualize your store floor plan with drag-and-drop editing.",
    ctaLabel: "View Layout",
    icon: <IconStoreLayout />,
  },
  {
    key: "analytics",
    to: "/analytics",
    label: "Analytics",
    description: "View sales trends, inventory turnover, and performance metrics.",
    ctaLabel: "View Analytics",
    icon: <IconAnalytics />,
    disabled: true,
  },
  {
    key: "organization",
    to: "/org-settings",
    label: "Organization",
    description: "Manage team members, roles, and organization settings.",
    ctaLabel: "Manage Org",
    icon: <IconOrganization />,
    requiredOrgRoles: [OrgRole.OWNER, OrgRole.ADMIN],
  },
  {
    key: "admin",
    to: "/admin",
    label: "System Admin",
    description: "Onboard organizations, manage all users, and oversee the platform.",
    ctaLabel: "Open Admin",
    icon: <IconAdmin />,
    requiredSystemRole: SystemRole.ADMIN,
  },
];
