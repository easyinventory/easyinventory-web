import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RequireOrg from "./components/auth/RequireOrg";
import RoleRoute from "./components/auth/RoleRoute";
import AppLayout from "./shared/components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductFormPage from "./pages/ProductFormPage";
import InventoryPage from "./pages/InventoryPage";
import StoreLayoutPage from "./pages/StoreLayoutPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SuppliersPage from "./pages/SuppliersPage";
import OrgSettingsPage from "./pages/OrgSettingsPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";
import { OrgRole, SystemRole } from "./shared/constants/roles";

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
  );
}