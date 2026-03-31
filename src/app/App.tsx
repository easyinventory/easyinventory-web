import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "../features/auth/context/AuthContext";
import { ErrorBoundary } from "../shared/components/ui";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import RequireOrg from "../features/auth/components/RequireOrg";
import RoleRoute from "../features/auth/components/RoleRoute";
import AppLayout from "../shared/components/layout/AppLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProductListPage from "../features/products/pages/ProductListPage";
import ProductDetailPage from "../features/products/pages/ProductDetailPage";
import ProductFormPage from "../features/products/pages/ProductFormPage";
import InventoryPage from "../features/inventory/pages/InventoryPage";
import StoreLayoutPage from "../features/store-layout/pages/StoreLayoutPage";
import AnalyticsPage from "../features/analytics/pages/AnalyticsPage";
import SuppliersPage from "../features/suppliers/pages/SuppliersPage";
import OrgSettingsPage from "../features/org/pages/OrgSettingsPage";
import AdminPage from "../features/admin/pages/AdminPage";
import NotFoundPage from "./NotFoundPage";
import { OrgRole, SystemRole } from "../shared/constants/roles";
import { StoreProvider } from "../features/store-layout/context/StoreContext";

export default function App() {
  return (
    <ErrorBoundary>
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
              <Route element={<StoreProvider><AppLayout /></StoreProvider>}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/new" element={<ProductFormPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/products/:id/edit" element={<ProductFormPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/store-layout" element={<StoreLayoutPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route
                  path="/org-settings"
                  element={
                    <RoleRoute allowedRoles={[OrgRole.OWNER, OrgRole.ADMIN]} roleField="org_role">
                      <OrgSettingsPage />
                    </RoleRoute>
                  }
                />
                {/* System admin routes — gated on system_role */}
                <Route
                  path="/admin"
                  element={
                    <RoleRoute allowedRoles={[SystemRole.ADMIN]} roleField="system_role">
                      <AdminPage />
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
    </ErrorBoundary>
  );
}