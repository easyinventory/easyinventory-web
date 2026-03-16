import { BrowserRouter, Routes, Route } from "react-router-dom";

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

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
    </BrowserRouter>
  );
}