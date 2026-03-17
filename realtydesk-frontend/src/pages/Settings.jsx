import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PROVINCES } from "../constants/provinces.js";
import { Select } from "../components/Input.jsx";
import Btn from "../components/Btn.jsx";
import Badge from "../components/Badge.jsx";

export default function Settings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: settingsApi.get });
  const [province, setProvince] = useState("AB");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings?.province) setProvince(settings.province);
  }, [settings]);

  const updateMut = useMutation({
    mutationFn: () => settingsApi.update({ province }),
    onSuccess: () => { setSaved(true); qc.invalidateQueries({ queryKey: ["settings"] }); setTimeout(() => setSaved(false), 2000); },
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Settings</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, margin: "4px 0 0" }}>Account and app preferences</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Account info */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 20px" }}>Account</h3>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>FULL NAME</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#1a1a2e" }}>{user?.full_name}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>EMAIL</div>
            <div style={{ fontSize: 14, color: "#475569" }}>{user?.email}</div>
          </div>
        </div>

        {/* Tax settings */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 20px" }}>Tax settings</h3>
          <Select
            label="Default province / territory"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            options={PROVINCES.map((p) => ({ value: p.code, label: `${p.name} (${p.hst ? `HST ${p.hst}%` : `GST ${p.gst}%`})` }))}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Btn variant="primary" onClick={() => updateMut.mutate()} disabled={updateMut.isPending}>
              {updateMut.isPending ? "Saving..." : "Save settings"}
            </Btn>
            {saved && <span style={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>Saved!</span>}
          </div>
        </div>

        {/* Integrations */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24, gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 20px" }}>Integrations</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { name: "Google Calendar", description: "Sync meetings and showings with your Google Calendar", icon: "calendar", connected: settings?.google_calendar_connected },
              { name: "Google Drive",    description: "Link client folders and manage documents in Drive",     icon: "drive",    connected: settings?.google_drive_connected },
            ].map((int) => (
              <div key={int.name} style={{ flex: "1 0 280px", background: "#fafaf8", borderRadius: 12, padding: 20, border: "1px solid #e8e6e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{int.name}</div>
                  <Badge color={int.connected ? "#059669" : "#94a3b8"}>{int.connected ? "Connected" : "Not connected"}</Badge>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>{int.description}</div>
                <Btn disabled style={{ opacity: 0.5 }}>{int.connected ? "Disconnect" : "Connect (coming soon)"}</Btn>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
