import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useOrg } from "../../../features/org/context/useOrg";
import Sidebar from "./Sidebar";
import "./AppLayout.css";

function IconHamburger() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 6 L18 6" />
      <path d="M4 11 L18 11" />
      <path d="M4 16 L18 16" />
    </svg>
  );
}

export default function AppLayout() {
  const { selectedOrgId } = useOrg();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile top bar */}
      <header className="app-layout__mobile-header">
        <button
          className="app-layout__hamburger"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <IconHamburger />
        </button>
        <img src="/favicon-ez.svg" className="app-layout__mobile-logo" alt="EZInventory" />
        <span className="app-layout__mobile-title">EZInventory</span>
      </header>

      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <main className="app-layout__main">
        <Outlet key={selectedOrgId} />
      </main>
    </div>
  );
}