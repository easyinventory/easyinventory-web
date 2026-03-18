import { useState } from "react";
import type { JSX } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useOrg } from "../../org/useOrg";
import OrgSwitcher from "./OrgSwitcher";
import "./Sidebar.css";

/* ── SVG Icon Components ── */

function IconDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" />
    </svg>
  );
}

function IconProducts() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2 L17 6 L17 14 L10 18 L3 14 L3 6 Z" />
      <path d="M10 10 L17 6" />
      <path d="M10 10 L3 6" />
      <path d="M10 10 L10 18" />
    </svg>
  );
}

function IconInventory() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2.5" width="14" height="15" rx="1.5" />
      <path d="M7 6.5 L13 6.5" />
      <path d="M7 9.5 L13 9.5" />
      <path d="M7 12.5 L10 12.5" />
    </svg>
  );
}

function IconStoreLayout() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" />
      <path d="M2.5 7.5 L17.5 7.5" />
      <path d="M8.5 7.5 L8.5 17.5" />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 14 L5.5 9" />
      <path d="M10 14 L10 5" />
      <path d="M14.5 14 L14.5 8" />
      <path d="M3 16.5 L17 16.5" />
    </svg>
  );
}

function IconSuppliers() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="10" height="6" rx="1" />
      <path d="M12 12.5 L15.5 12.5 L17.5 14.5 L17.5 16 L12 16" />
      <circle cx="5.5" cy="16.5" r="1.5" />
      <circle cx="15" cy="16.5" r="1.5" />
      <path d="M7 10 L7 6 L14 6 L14 10" />
    </svg>
  );
}

function IconOrganization() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="2.5" />
      <circle cx="4.5" cy="10" r="2" />
      <circle cx="15.5" cy="10" r="2" />
      <path d="M6 15.5 C6 13.5 7.8 12 10 12 C12.2 12 14 13.5 14 15.5" />
      <path d="M2 17 C2 15.3 3 14 4.5 14" />
      <path d="M18 17 C18 15.3 17 14 15.5 14" />
    </svg>
  );
}

function IconAdmin() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2 L17 5.5 L17 10 C17 14 14 17 10 18.5 C6 17 3 14 3 10 L3 5.5 Z" />
      <path d="M7.5 10 L9.5 12 L13 8" />
    </svg>
  );
}

function IconCollapse() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4 L6 9 L11 14" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4 L12 9 L7 14" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3 L3 3 L3 15 L6 15" />
      <path d="M7 9 L15 9" />
      <path d="M12 6 L15 9 L12 12" />
    </svg>
  );
}

/* ── Icon lookup map ── */

const iconMap: Record<string, () => JSX.Element> = {
  "/": IconDashboard,
  "/products": IconProducts,
  "/inventory": IconInventory,
  "/store-layout": IconStoreLayout,
  "/analytics": IconAnalytics,
  "/suppliers": IconSuppliers,
  "/org-settings": IconOrganization,
  "/admin": IconAdmin,
};

/* ── Nav config ── */

interface NavItem {
  to: string;
  label: string;
  requiredOrgRoles?: string[];
  requiredSystemRole?: string;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/inventory", label: "Inventory" },
  { to: "/store-layout", label: "Store layout" },
  { to: "/analytics", label: "Analytics" },
  { to: "/suppliers", label: "Suppliers" },
  {
    to: "/org-settings",
    label: "Organization",
    requiredOrgRoles: ["ORG_OWNER", "ORG_ADMIN"],
  },
  {
    to: "/admin",
    label: "System Admin",
    requiredSystemRole: "SYSTEM_ADMIN",
  },
];

/* ── Sidebar Component ── */

export default function Sidebar() {
  const { user, profile, logout } = useAuth();
  const { selectedOrgRole } = useOrg();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter nav items based on org/system roles
  const visibleItems = navItems.filter((item) => {
    if (item.requiredOrgRoles) {
      return (
        selectedOrgRole != null &&
        item.requiredOrgRoles.includes(selectedOrgRole)
      );
    }
    if (item.requiredSystemRole) {
      return profile?.system_role === item.requiredSystemRole;
    }
    return true;
  });

  // Format org role for display
  const roleLabel = selectedOrgRole
    ? selectedOrgRole.replace("ORG_", "").toLowerCase()
    : "member";

  const isOrgAdmin =
    selectedOrgRole === "ORG_OWNER" ||
    selectedOrgRole === "ORG_ADMIN";

  const roleClass = isOrgAdmin
    ? "sidebar__role-badge--admin"
    : "sidebar__role-badge--user";

  // User initials for collapsed avatar
  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "—";

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* ── Logo Area ── */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <img src="/favicon-ez.svg" className="sidebar__logo-icon" alt="EZInventory" />
          <span className="sidebar__logo-text">EZInventory</span>
        </div>
      </div>

      {/* ── Org Switcher ── */}
      <OrgSwitcher />

      {/* ── Navigation ── */}
      <nav className="sidebar__nav">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.to] || IconDashboard;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `sidebar__link${isActive ? " sidebar__link--active" : ""}${
                  item.requiredSystemRole ? " sidebar__link--admin" : ""
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar__link-icon">
                <Icon />
              </span>
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ── User + Collapse ── */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar" title={user?.email || ""}>
            {initials}
          </div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-email">{user?.email || "—"}</p>
            <span className={`sidebar__role-badge ${roleClass}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        <button
          className="sidebar__logout"
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
        >
          <span className="sidebar__link-icon">
            <IconLogout />
          </span>
          <span className="sidebar__link-label">Sign out</span>
        </button>

        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <IconExpand /> : <IconCollapse />}
        </button>
      </div>
    </aside>
  );
}