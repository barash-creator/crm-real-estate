import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafaf8" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", padding: "32px 36px", minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
