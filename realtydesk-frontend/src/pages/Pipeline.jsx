import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { clientsApi } from "../api/clients.js";
import { STAGES } from "../constants/stages.js";
import Icon from "../components/Icon.jsx";
import Btn from "../components/Btn.jsx";
import { fmt } from "../utils/format.js";

export default function Pipeline() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: clients = [], isLoading } = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.getAll() });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }) => clientsApi.updateStage(id, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  if (isLoading) return <div style={{ color: "#94a3b8", padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Pipeline</h1>
        <Btn variant="primary" onClick={() => navigate("/clients")}>
          <Icon name="plus" size={14} /> New client
        </Btn>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, alignItems: "flex-start" }}>
        {STAGES.map((stage) => {
          const stageClients = clients.filter((c) => c.stage === stage.id);
          return (
            <div key={stage.id} style={{ minWidth: 220, maxWidth: 260, flex: "1 0 220px", background: "#fafaf8", borderRadius: 14, padding: "12px 12px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 4px" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: stage.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" }}>{stage.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginLeft: "auto" }}>{stageClients.length}</span>
              </div>

              {stageClients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/clients/${c.id}`)}
                  style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", marginBottom: 8, border: "1px solid #e8e6e1", cursor: "pointer" }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                    {c.type === "buyer" ? "Buyer" : "Seller"}{c.budget ? ` — ${fmt(c.budget)}` : ""}
                  </div>
                  {c.address && <div style={{ fontSize: 11, color: "#64748b" }}>{c.address}</div>}

                  {/* Stage progress bar */}
                  <div style={{ display: "flex", gap: 3, marginTop: 10 }}>
                    {STAGES.map((s, i) => {
                      const ci = STAGES.findIndex((st) => st.id === stage.id);
                      return <div key={s.id} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= ci ? stage.color : "#e8e6e1" }} />;
                    })}
                  </div>

                  {/* Stage move buttons */}
                  <div style={{ display: "flex", gap: 4, marginTop: 8, justifyContent: "flex-end" }}>
                    {STAGES.findIndex((s) => s.id === stage.id) > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); stageMutation.mutate({ id: c.id, stage: STAGES[STAGES.findIndex((s) => s.id === stage.id) - 1].id }); }}
                        style={{ background: "#f1f0ec", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11, color: "#64748b" }}
                      >←</button>
                    )}
                    {STAGES.findIndex((s) => s.id === stage.id) < STAGES.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); stageMutation.mutate({ id: c.id, stage: STAGES[STAGES.findIndex((s) => s.id === stage.id) + 1].id }); }}
                        style={{ background: "#f1f0ec", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11, color: "#64748b" }}
                      >→</button>
                    )}
                  </div>
                </div>
              ))}

              {!stageClients.length && (
                <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#cbd5e1" }}>No clients</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
