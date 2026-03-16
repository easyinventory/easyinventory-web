import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RequireOrg from "./components/auth/RequireOrg";
import RoleRoute from "./components/auth/RoleRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import StoreLayoutPage from "./pages/StoreLayoutPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SuppliersPage from "./pages/SuppliersPage";
import OrgSettingsPage from "./pages/OrgSettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes — no auth needed */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes — must be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RequireOrg />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/store-layout" element={<StoreLayoutPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route
                  path="/org-settings"
                  element={
                    <RoleRoute allowedRoles={["ORG_OWNER", "ORG_ADMIN"]} roleField="org_role">
                      <OrgSettingsPage />
                    </RoleRoute>
                  }
                />
              </Route>
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}