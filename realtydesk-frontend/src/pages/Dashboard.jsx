import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../api/settings.js";
import StatCard from "../components/StatCard.jsx";
import Badge from "../components/Badge.jsx";
import Icon from "../components/Icon.jsx";
import Btn from "../components/Btn.jsx";
import { fmt, fmtDec, pct } from "../utils/format.js";
import { STAGES } from "../constants/stages.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: dashboardApi.get });

  if (isLoading) return <div style={{ color: "#94a3b8", padding: 40 }}>Loading...</div>;

  const d = data || {};
  const margin = d.totalRevenue ? (d.netIncome / d.totalRevenue) : 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Dashboard</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "4px 0 0" }}>Welcome back. Here&apos;s your overview.</p>
        </div>
        <Btn variant="primary" onClick={() => navigate("/clients")}>
          <Icon name="plus" size={14} /> New client
        </Btn>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Total clients"   value={d.totalClients ?? 0}         sub={`${d.activeDeals ?? 0} active deals`} />
        <StatCard label="Net commission"  value={fmt(d.totalRevenue)}          sub="Year to date" accent="#059669" />
        <StatCard label="Expenses"        value={fmt(d.totalExpenses)}         sub="Year to date" accent="#dc2626" />
        <StatCard label="Net income"      value={fmt(d.netIncome)}             sub={`${pct(margin)} margin`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Pipeline snapshot */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Pipeline snapshot</h3>
          {STAGES.map((s) => {
            const item = (d.pipelineSnapshot || []).find((p) => p.stage === s.id);
            const count = item ? Number(item.count) : 0;
            const total = d.totalClients || 1;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#475569", flex: 1 }}>{s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{count}</span>
                <div style={{ width: 80, height: 6, background: "#f1f0ec", borderRadius: 3 }}>
                  <div style={{ width: `${(count / total) * 100}%`, height: "100%", background: s.color, borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming meetings */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Upcoming meetings</h3>
          {!(d.upcomingMeetings?.length) ? (
            <p style={{ color: "#94a3b8", fontSize: 13 }}>No upcoming meetings. Add one from a client&apos;s detail view.</p>
          ) : d.upcomingMeetings.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f0ec" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="calendar" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{m.title}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  {m.client_name} — {new Date(m.datetime).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <Badge color={m.type === "showing" ? "#3b82f6" : m.type === "closing" ? "#059669" : "#8b5cf6"}>{m.type}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24, marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Recent transactions</h3>
        {!(d.recentTransactions?.length) ? (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>No transactions yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: "2px solid #f1f0ec" }}>
              {["Client", "Property", "Sale price", "Commission", "Status"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{d.recentTransactions.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #f5f4f1" }}>
                <td style={{ padding: "10px 12px", fontWeight: 500 }}>{t.client_name || "—"}</td>
                <td style={{ padding: "10px 12px", color: "#64748b" }}>{t.address}</td>
                <td style={{ padding: "10px 12px" }}>{fmt(t.sale_price)}</td>
                <td style={{ padding: "10px 12px", color: "#059669", fontWeight: 600 }}>{fmtDec(t.net_commission)}</td>
                <td style={{ padding: "10px 12px" }}><Badge color={t.status === "closed" ? "#059669" : "#f59e0b"}>{t.status}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
