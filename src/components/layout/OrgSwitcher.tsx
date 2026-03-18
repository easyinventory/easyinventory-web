import { useState } from "react";
import { useOrg } from "../../org/useOrg";
import "./OrgSwitcher.css";

export default function OrgSwitcher() {
  const { memberships, selectedOrgId, selectedOrgName, switchOrg, hasMultipleOrgs } = useOrg();
  const [isOpen, setIsOpen] = useState(false);

  if (memberships.length === 0) return null;

  const orgInitials = selectedOrgName
    ? selectedOrgName.slice(0, 2).toUpperCase()
    : "—";

  const handleToggle = () => {
    if (hasMultipleOrgs) setIsOpen((o) => !o);
  };

  const handleSwitch = (orgId: string) => {
    switchOrg(orgId);
    setIsOpen(false);
  };

  return (
    <div className="org-switcher">
      <div
        className={`org-switcher__current${hasMultipleOrgs ? " org-switcher__current--clickable" : ""}`}
        onClick={handleToggle}
        title={selectedOrgName ?? undefined}
      >
        <div className="org-switcher__icon">{orgInitials}</div>
        <div className="org-switcher__details">
          <div className="org-switcher__name">{selectedOrgName ?? "No org"}</div>
          <div className="org-switcher__label">Organization</div>
        </div>
        {hasMultipleOrgs && (
          <span className={`org-switcher__chevron${isOpen ? " org-switcher__chevron--open" : ""}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4.5 L6 7.5 L9 4.5" />
            </svg>
          </span>
        )}
      </div>

      {isOpen && hasMultipleOrgs && (
        <div className="org-switcher__dropdown">
          {memberships.map((m) => (
            <button
              key={m.org_id}
              className={`org-switcher__option${m.org_id === selectedOrgId ? " org-switcher__option--active" : ""}`}
              onClick={() => handleSwitch(m.org_id)}
            >
              <span className="org-switcher__option-check">
                {m.org_id === selectedOrgId ? "✓" : ""}
              </span>
              {m.organization.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
