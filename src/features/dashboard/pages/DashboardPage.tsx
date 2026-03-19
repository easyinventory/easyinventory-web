import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/useAuth";
import { useOrg } from "../../org/context/useOrg";
import { navItems } from "../../../shared/constants/navigation";
import type { OrgRole } from "../../../shared/constants/roles";
import PageHeader from "../../../shared/components/layout/PageHeader";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { selectedOrgRole, selectedOrgName } = useOrg();

  const dashboardCards = navItems.filter((item) => {
    if (item.hideFromDashboard) return false;
    if (item.requiredOrgRoles) {
      return selectedOrgRole != null && item.requiredOrgRoles.includes(selectedOrgRole as OrgRole);
    }
    if (item.requiredSystemRole) {
      return profile?.system_role === item.requiredSystemRole;
    }
    return true;
  });

  const subtitle = selectedOrgName
    ? `Welcome back — here's what's available for ${selectedOrgName}.`
    : "Welcome back — here's an overview of your workspace.";

  return (
    <div className="dashboard">
      <PageHeader title="Dashboard" subtitle={subtitle} />

      <div className="dashboard__grid">
        {dashboardCards.map((card) => (
          <div
            key={card.key}
            className={`dashboard-card${card.disabled ? " dashboard-card--disabled" : ""}`}
          >
            <div className={`dashboard-card__icon dashboard-card__icon--${card.key}`}>
              {card.icon}
            </div>
            <h3 className="dashboard-card__title">{card.label}</h3>
            <p className="dashboard-card__desc">{card.description}</p>
            {card.disabled ? (
              <span className="dashboard-card__badge">Coming Soon</span>
            ) : (
              <Link to={card.to} className="dashboard-card__cta">
                {card.ctaLabel}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}