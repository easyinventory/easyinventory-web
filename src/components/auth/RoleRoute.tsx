import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

interface RoleRouteProps {
  allowedRoles: string[];
  roleField?: "system_role" | "org_role";
  children?: React.ReactNode;
}

export default function RoleRoute({
  allowedRoles,
  roleField = "system_role",
  children,
}: RoleRouteProps) {
  const { profile } = useAuth();

  const userRole = profile?.[roleField];

  // No profile loaded, no role, or role not allowed → bounce to dashboard
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Supports both wrapper and layout usage:
  //   <RoleRoute allowedRoles={["ORG_ADMIN"]} roleField="org_role"><Page /></RoleRoute>
  //   <Route element={<RoleRoute allowedRoles={["SYSTEM_ADMIN"]} />}>
  return children ? <>{children}</> : <Outlet />;
}