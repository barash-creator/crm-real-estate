import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Icon from "../Icon.jsx";

const NAV_ITEMS = [
  { to: "/",           icon: "home",     label: "Dashboard"      },
  { to: "/pipeline",   icon: "pipeline", label: "Pipeline"       },
  { to: "/clients",    icon: "users",    label: "Clients"        },
  { to: "/calendar",   icon: "calendar", label: "Calendar"       },
  { to: "/accounting", icon: "dollar",   label: "Accounting"     },
  { to: "/tax",        icon: "file",     label: "Tax calculator" },
  { to: "/settings",   icon: "settings", label: "Settings"       },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={{
      width: collapsed ? 64 : 224, flexShrink: 0, background: "#1a1a2e",
      height: "100vh", display: "flex", flexDirection: "column",
      transition: "width 0.2s", position: "sticky", top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "20px 16px" : "20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setCollapsed(!collapsed)}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#c8a45a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>R</span>
        </div>
        {!collapsed && <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>RealtyDesk</span>}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
            borderRadius: 10, textDecoration: "none", marginBottom: 2, transition: "all 0.15s",
            color: isActive ? "#c8a45a" : "rgba(255,255,255,0.6)",
            background: isActive ? "rgba(200,164,90,0.1)" : "transparent",
          })}>
            <Icon name={icon} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {!collapsed && user && (
          <div style={{ padding: "8px 12px", marginBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.full_name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
          borderRadius: 10, background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.5)", width: "100%", fontSize: 13, fontWeight: 500,
        }}>
          <Icon name="logout" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </div>
  );
}
