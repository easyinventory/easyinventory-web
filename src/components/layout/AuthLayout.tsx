import "../../pages/AuthPage.css";

/* ── SVG Icons for feature list ── */

function IconInventory() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2 L17 6 L17 14 L10 18 L3 14 L3 6 Z" />
      <path d="M10 10 L17 6" />
      <path d="M10 10 L3 6" />
      <path d="M10 10 L10 18" />
    </svg>
  );
}

function IconLayout() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" />
      <path d="M2.5 7.5 L17.5 7.5" />
      <path d="M8.5 7.5 L8.5 17.5" />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 14 L5.5 9" />
      <path d="M10 14 L10 5" />
      <path d="M14.5 14 L14.5 8" />
      <path d="M3 16.5 L17 16.5" />
    </svg>
  );
}

function IconTeam() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="2.5" />
      <circle cx="4.5" cy="10" r="2" />
      <circle cx="15.5" cy="10" r="2" />
      <path d="M6 15.5 C6 13.5 7.8 12 10 12 C12.2 12 14 13.5 14 15.5" />
    </svg>
  );
}

/* ── AuthLayout ── */

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      {/* ── Branded left panel ── */}
      <div className="auth-page__brand">
        <div className="auth-page__brand-logo">
          <img src="/favicon-ez.svg" className="auth-page__brand-mark" alt="EZInventory" />
          <span className="auth-page__brand-name">EZInventory</span>
        </div>

        <p className="auth-page__brand-tagline">
          Inventory management and spatial merchandising for modern retail.
        </p>

        <ul className="auth-page__brand-features">
          <li className="auth-page__brand-feature">
            <span className="auth-page__brand-feature-icon">
              <IconInventory />
            </span>
            Track stock across all locations
          </li>
          <li className="auth-page__brand-feature">
            <span className="auth-page__brand-feature-icon">
              <IconLayout />
            </span>
            Visual store layout builder
          </li>
          <li className="auth-page__brand-feature">
            <span className="auth-page__brand-feature-icon">
              <IconAnalytics />
            </span>
            Zone-level heatmap analytics
          </li>
          <li className="auth-page__brand-feature">
            <span className="auth-page__brand-feature-icon">
              <IconTeam />
            </span>
            Multi-tenant team management
          </li>
        </ul>
      </div>

      {/* ── Form panel (right) ── */}
      <div className="auth-page__content">
        {children}
      </div>
    </div>
  );
}
