import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { useOrg } from "../../../org/useOrg";
import { navItems } from "../../../constants/navigation";
import type { OrgRole } from "../../../constants/roles";
import OrgSwitcher from "./OrgSwitcher";
import "./Sidebar.css";

/* ── Sidebar-only icons (not part of nav config) ── */

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

/* ── Sidebar Component ── */

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, profile, logout } = useAuth();
  const { selectedOrgRole } = useOrg();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close mobile drawer on route change (but not on mount)
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const onMobileCloseRef = useRef(onMobileClose);

  useEffect(() => {
    onMobileCloseRef.current = onMobileClose;
  }, [onMobileClose]);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      onMobileCloseRef.current?.();
    }
  }, [location.pathname]);

  // Filter nav items based on org/system roles
  const visibleItems = navItems.filter((item) => {
    if (item.requiredOrgRoles) {
      return (
        selectedOrgRole != null &&
        item.requiredOrgRoles.includes(selectedOrgRole as OrgRole)
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
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="sidebar__backdrop" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}${mobileOpen ? " sidebar--mobile-open" : ""}`}>
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
          const adminClass = item.requiredSystemRole ? " sidebar__link--admin" : "";

          if (item.disabled) {
            return (
              <span
                key={item.to}
                className={`sidebar__link sidebar__link--disabled${adminClass}`}
                title={collapsed ? `${item.label} (coming soon)` : undefined}
              >
                <span className="sidebar__link-icon">
                  {item.icon}
                </span>
                <span className="sidebar__link-label">
                  {item.label}
                  <span className="sidebar__coming-soon">Soon</span>
                </span>
              </span>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `sidebar__link${isActive ? " sidebar__link--active" : ""}${adminClass}`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar__link-icon">
                {item.icon}
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
    </>
  );
}