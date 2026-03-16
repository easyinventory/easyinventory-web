import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import StoreLayoutPage from "./pages/StoreLayoutPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SuppliersPage from "./pages/SuppliersPage";
import OrgSettingsPage from "./pages/OrgSettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* App routes (will be protected in PR-11) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/store-layout" element={<StoreLayoutPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/org-settings" element={<OrgSettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}