import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { OrgRole, SystemRole } from "../../constants/roles";
import "./Sidebar.css";

interface NavItem {
  to: string;
  label: string;
  requiredOrgRoles?: OrgRole[];
  requiredSystemRole?: SystemRole;
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
    requiredOrgRoles: [OrgRole.OWNER, OrgRole.ADMIN],
  },
  {
    to: "/admin",
    label: "System Admin",
    requiredSystemRole: SystemRole.ADMIN,
  },
];

export default function Sidebar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter nav items based on org/system roles
  const visibleItems = navItems.filter((item) => {
    if (item.requiredOrgRoles) {
      return (
        profile?.org_role != null &&
        item.requiredOrgRoles.includes(profile.org_role)
      );
    }
    if (item.requiredSystemRole) {
      return profile?.system_role === item.requiredSystemRole;
    }
    return true;
  });

  // Format org role for display
  const roleLabel = profile?.org_role
    ? profile.org_role.replace("ORG_", "").toLowerCase()
    : "member";

  const isOrgAdmin =
    profile?.org_role === OrgRole.OWNER ||
    profile?.org_role === OrgRole.ADMIN;

  const roleClass = isOrgAdmin
    ? "sidebar__role-badge--admin"
    : "sidebar__role-badge--user";

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">EasyInventory</div>

      <nav className="sidebar__nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `sidebar__link${isActive ? " sidebar__link--active" : ""}${
                item.requiredSystemRole ? " sidebar__link--admin" : ""
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__user">
        <p className="sidebar__user-email">{user?.email || "—"}</p>
        <span className={`sidebar__role-badge ${roleClass}`}>
          {roleLabel}
        </span>
        <button className="sidebar__logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}