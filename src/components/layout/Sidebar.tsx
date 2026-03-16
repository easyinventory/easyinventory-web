import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/inventory", label: "Inventory" },
  { to: "/store-layout", label: "Store layout" },
  { to: "/analytics", label: "Analytics" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/org-settings", label: "Organization" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">EasyInventory</div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `sidebar__link${isActive ? " sidebar__link--active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p>Org: —</p>
        <p>Role: —</p>
      </div>
    </aside>
  );
}