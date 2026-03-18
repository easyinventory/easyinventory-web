import { Outlet } from "react-router-dom";
import { useOrg } from "../../org/useOrg";
import Sidebar from "./Sidebar";
import "./AppLayout.css";

export default function AppLayout() {
  const { selectedOrgId } = useOrg();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-layout__main">
        <Outlet key={selectedOrgId} />
      </main>
    </div>
  );
}