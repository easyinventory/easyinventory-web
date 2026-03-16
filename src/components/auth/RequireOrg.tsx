import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./RequireOrg.css";

export default function RequireOrg() {
  const { profile, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // User has no org membership — show waiting screen
  if (!profile?.org_role) {
    return (
      <div className="no-org">
        <div className="no-org__card">
          <div className="no-org__icon">
            <span>🏢</span>
          </div>
          <h1 className="no-org__title">Waiting for organization access</h1>
          <p className="no-org__message">
            You haven't been added to an organization yet.
            Ask your team admin to invite you using your email address.
          </p>
          <p className="no-org__email">
            Signed in as {user?.email}
          </p>
          <button className="no-org__logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Has org access — render normally
  return <Outlet />;
}