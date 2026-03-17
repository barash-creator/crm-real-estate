import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { clientsApi } from "../api/clients.js";
import { STAGES } from "../constants/stages.js";
import Badge from "../components/Badge.jsx";
import Btn from "../components/Btn.jsx";
import Icon from "../components/Icon.jsx";
import { Input } from "../components/Input.jsx";
import AddClientModal from "../modals/AddClientModal.jsx";
import { fmt } from "../utils/format.js";

export default function Clients() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: () => clientsApi.getAll(search ? { search } : {}),
  });

  const stageColor = (id) => STAGES.find((s) => s.id === id)?.color || "#94a3b8";
  const stageLabel = (id) => STAGES.find((s) => s.id === id)?.label || id;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Clients</h1>
        <Btn variant="primary" onClick={() => setShowAdd(true)}><Icon name="plus" size={14} /> New client</Btn>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24 }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, background: "#fafaf8", borderRadius: 10, padding: "8px 14px", border: "1px solid #e2e0db" }}>
          <Icon name="search" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or address..."
            style={{ border: "none", outline: "none", background: "none", flex: 1, fontSize: 14 }}
          />
        </div>

        {isLoading ? (
          <div style={{ color: "#94a3b8", padding: 20 }}>Loading...</div>
        ) : clients.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
            {search ? "No clients match your search." : "No clients yet. Add your first client!"}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: "2px solid #f1f0ec" }}>
              {["Name", "Type", "Stage", "Budget / Price", "Contact"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{clients.map((c) => (
              <tr key={c.id} onClick={() => navigate(`/clients/${c.id}`)} style={{ borderBottom: "1px solid #f5f4f1", cursor: "pointer" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fafaf8"}
                onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                <td style={{ padding: "12px 12px", fontWeight: 600, color: "#1a1a2e" }}>{c.name}</td>
                <td style={{ padding: "12px 12px" }}><Badge color={c.type === "buyer" ? "#3b82f6" : "#8b5cf6"}>{c.type}</Badge></td>
                <td style={{ padding: "12px 12px" }}><Badge color={stageColor(c.stage)}>{stageLabel(c.stage)}</Badge></td>
                <td style={{ padding: "12px 12px", color: "#475569" }}>{c.budget ? fmt(c.budget) : "—"}</td>
                <td style={{ padding: "12px 12px", color: "#64748b" }}>{c.email || c.phone || "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      <AddClientModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); qc.invalidateQueries({ queryKey: ["clients"] }); }} />
    </div>
  );
}
