/* ═══════════════════════════════════════════════════════
   Nav Icons — SVG icon components for navigation items.
   Responsive (no fixed width/height) — sized by parent.
   ═══════════════════════════════════════════════════════ */

export function IconDashboard() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" />
    </svg>
  );
}

export function IconProducts() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2 L17 6 L17 14 L10 18 L3 14 L3 6 Z" />
      <path d="M10 10 L17 6" /><path d="M10 10 L3 6" /><path d="M10 10 L10 18" />
    </svg>
  );
}

export function IconInventory() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2.5" width="14" height="15" rx="1.5" />
      <path d="M7 6.5 L13 6.5" /><path d="M7 9.5 L13 9.5" /><path d="M7 12.5 L10 12.5" />
    </svg>
  );
}

export function IconSuppliers() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="10" height="6" rx="1" />
      <path d="M12 12.5 L15.5 12.5 L17.5 14.5 L17.5 16 L12 16" />
      <circle cx="5.5" cy="16.5" r="1.5" /><circle cx="15" cy="16.5" r="1.5" />
      <path d="M7 10 L7 6 L14 6 L14 10" />
    </svg>
  );
}

export function IconStoreLayout() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" />
      <path d="M2.5 7.5 L17.5 7.5" /><path d="M8.5 7.5 L8.5 17.5" />
    </svg>
  );
}

export function IconAnalytics() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 14 L5.5 9" /><path d="M10 14 L10 5" /><path d="M14.5 14 L14.5 8" />
      <path d="M3 16.5 L17 16.5" />
    </svg>
  );
}

export function IconOrganization() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="2.5" />
      <circle cx="4.5" cy="10" r="2" /><circle cx="15.5" cy="10" r="2" />
      <path d="M6 15.5 C6 13.5 7.8 12 10 12 C12.2 12 14 13.5 14 15.5" />
      <path d="M2 17 C2 15.3 3 14 4.5 14" /><path d="M18 17 C18 15.3 17 14 15.5 14" />
    </svg>
  );
}

export function IconAdmin() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2 L17 5.5 L17 10 C17 14 14 17 10 18.5 C6 17 3 14 3 10 L3 5.5 Z" />
      <path d="M7.5 10 L9.5 12 L13 8" />
    </svg>
  );
}
