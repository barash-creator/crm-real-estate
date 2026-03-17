import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/settings.js";
import { settingsApi } from "../api/settings.js";
import { FEDERAL_BRACKETS, FEDERAL_BPA, PROVINCIAL_BRACKETS } from "../constants/tax.js";
import { PROVINCES } from "../constants/provinces.js";
import { calcBracketTax, calcCPP } from "../utils/tax.js";
import { fmt, fmtDec, pct } from "../utils/format.js";
import { Select } from "../components/Input.jsx";
import StatCard from "../components/StatCard.jsx";

export default function TaxCalculator() {
  const { data: dash }     = useQuery({ queryKey: ["dashboard"], queryFn: dashboardApi.get });
  const { data: settings } = useQuery({ queryKey: ["settings"],  queryFn: settingsApi.get });
  const [province, setProvince] = useState(null); // null = use settings default

  const activeProvince = province || settings?.province || "AB";
  const netIncome = dash ? (dash.totalRevenue - dash.totalExpenses) : 0;
  const [customIncome, setCustomIncome] = useState("");
  const taxableIncome = customIncome !== "" ? parseFloat(customIncome) || 0 : Math.max(0, netIncome);

  const prov = PROVINCIAL_BRACKETS[activeProvince];
  const federalTax = calcBracketTax(taxableIncome, FEDERAL_BRACKETS, FEDERAL_BPA);
  const provincialTax = prov ? calcBracketTax(taxableIncome, prov.brackets, prov.bpa) : 0;
  const cpp = calcCPP(taxableIncome);
  const totalOwed = federalTax + provincialTax + cpp;
  const effectiveRate = taxableIncome > 0 ? totalOwed / taxableIncome : 0;

  const provInfo = PROVINCES.find((p) => p.code === activeProvince);
  const gstRate = provInfo?.hst ?? provInfo?.gst ?? 5;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Tax Calculator</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, margin: "4px 0 0" }}>2025/2026 Canadian federal + provincial tax estimates</p>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "0 0 200px" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>Province</label>
          <select value={activeProvince} onChange={(e) => setProvince(e.target.value)}
            style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e0db", fontSize: 14, background: "#fafaf8" }}>
            {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ flex: "0 0 220px" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>Custom net income ($)</label>
          <input value={customIncome} onChange={(e) => setCustomIncome(e.target.value)} type="number" placeholder={`Using ${fmt(taxableIncome)} from accounting`}
            style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e0db", fontSize: 14, background: "#fafaf8", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Taxable income"   value={fmt(taxableIncome)}   sub="Net commissions − expenses" />
        <StatCard label="Federal tax"      value={fmtDec(federalTax)}   sub={`Effective ${pct(federalTax / (taxableIncome || 1))}`} accent="#dc2626" />
        <StatCard label="Provincial tax"   value={fmtDec(provincialTax)} sub={`${activeProvince} rate`} accent="#f59e0b" />
        <StatCard label="CPP (self-employed)" value={fmtDec(cpp)}        sub="Both portions (11.9%)" accent="#6366f1" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Total estimate */}
        <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 28, color: "#fff" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Estimated total owing</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#c8a45a", lineHeight: 1.1 }}>{fmtDec(totalOwed)}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Effective rate: {pct(effectiveRate)}</div>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            {[["Federal income tax", federalTax, "#ef4444"], ["Provincial income tax", provincialTax, "#f59e0b"], ["CPP contributions", cpp, "#a78bfa"]].map(([label, amount, color]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
                </div>
                <span style={{ fontWeight: 600, color: "#fff" }}>{fmtDec(amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bracket breakdown */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Federal bracket breakdown</h3>
          {FEDERAL_BRACKETS.map((b, i) => {
            const min = Math.max(0, taxableIncome - FEDERAL_BPA);
            const inBracket = min > b.min;
            const amount = inBracket ? Math.min(Math.max(0, min - b.min), b.max === Infinity ? Infinity : b.max - b.min) * b.rate : 0;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{(b.rate * 100).toFixed(1)}%</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{fmt(b.min)} – {b.max === Infinity ? "∞" : fmt(b.max)}</div>
                  <div style={{ height: 6, background: "#f1f0ec", borderRadius: 3, marginTop: 3 }}>
                    <div style={{ height: "100%", background: inBracket ? "#c8a45a" : "#e8e6e1", borderRadius: 3, width: inBracket ? "100%" : "0%" }} />
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: inBracket ? "#1a1a2e" : "#cbd5e1", width: 80, textAlign: "right" }}>{inBracket ? fmtDec(amount) : "—"}</div>
              </div>
            );
          })}

          <div style={{ borderTop: "1px solid #f1f0ec", paddingTop: 12, marginTop: 4 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {provInfo?.hst ? `HST ${provInfo.hst}%` : `GST ${provInfo?.gst ?? 5}%`} applicable in {provInfo?.name} on commissions
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fffbf0", border: "1px solid #f5e7c0", borderRadius: 12, padding: "14px 18px", marginTop: 20, fontSize: 12, color: "#92710a" }}>
        <strong>Disclaimer:</strong> These are estimates only. Consult a CPA or tax professional for your actual tax obligations. Figures use 2025/2026 CRA brackets and do not account for other income sources, deductions, or credits.
      </div>
    </div>
  );
}
