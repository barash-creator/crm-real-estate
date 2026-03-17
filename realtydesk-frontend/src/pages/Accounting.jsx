import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../api/transactions.js";
import { expensesApi } from "../api/expenses.js";
import { clientsApi } from "../api/clients.js";
import Badge from "../components/Badge.jsx";
import Btn from "../components/Btn.jsx";
import Icon from "../components/Icon.jsx";
import StatCard from "../components/StatCard.jsx";
import Modal from "../components/Modal.jsx";
import { Input, Select } from "../components/Input.jsx";
import { fmt, fmtDec } from "../utils/format.js";
import { EXPENSE_CATS } from "../constants/expenses.js";

export default function Accounting() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("income"); // "income" | "expenses"
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddExp, setShowAddExp] = useState(false);
  const [txForm, setTxForm] = useState({ client_id: "", address: "", sale_price: "", commission_rate: "2.5", brokerage_split: "20", gst_collected: "0", closing_date: "", status: "pending" });
  const [expForm, setExpForm] = useState({ date: "", category: EXPENSE_CATS[0], description: "", amount: "", gst_paid: "0" });

  const { data: transactions = [] } = useQuery({ queryKey: ["transactions"], queryFn: () => transactionsApi.getAll() });
  const { data: expenses = [] }     = useQuery({ queryKey: ["expenses"],     queryFn: () => expensesApi.getAll() });
  const { data: clients = [] }      = useQuery({ queryKey: ["clients"],      queryFn: () => clientsApi.getAll() });

  const addTx = useMutation({ mutationFn: transactionsApi.create, onSuccess: () => { setShowAddTx(false); qc.invalidateQueries({ queryKey: ["transactions"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); } });
  const delTx = useMutation({ mutationFn: transactionsApi.remove, onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); } });
  const addExp = useMutation({ mutationFn: expensesApi.create, onSuccess: () => { setShowAddExp(false); qc.invalidateQueries({ queryKey: ["expenses"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); } });
  const delExp = useMutation({ mutationFn: expensesApi.remove, onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); } });

  const totalRevenue  = transactions.filter((t) => t.status === "closed").reduce((s, t) => s + (t.sale_price * (t.commission_rate / 100) * (1 - (t.brokerage_split || 0) / 100)), 0);
  const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const totalGstIn    = transactions.reduce((s, t) => s + parseFloat(t.gst_collected || 0), 0);
  const totalGstOut   = expenses.reduce((s, e) => s + parseFloat(e.gst_paid || 0), 0);

  const setTx  = (k) => (e) => setTxForm((f) => ({ ...f, [k]: e.target.value }));
  const setExp = (k) => (e) => setExpForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Accounting</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="primary" onClick={() => setShowAddTx(true)}><Icon name="plus" size={14} /> Add transaction</Btn>
          <Btn onClick={() => setShowAddExp(true)}><Icon name="plus" size={14} /> Add expense</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Net commission"  value={fmt(totalRevenue)}  sub="Closed deals" accent="#059669" />
        <StatCard label="Total expenses"  value={fmt(totalExpenses)} sub="All categories" accent="#dc2626" />
        <StatCard label="Net income"      value={fmt(totalRevenue - totalExpenses)} sub={`Margin: ${totalRevenue ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0}%`} />
        <StatCard label="GST/HST net"     value={fmtDec(totalGstIn - totalGstOut)} sub={`Collected ${fmtDec(totalGstIn)} · Paid ${fmtDec(totalGstOut)}`} accent="#6366f1" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 16, background: "#f1f0ec", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {["income","expenses"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 500, fontSize: 13, background: tab === t ? "#fff" : "transparent", color: tab === t ? "#1a1a2e" : "#64748b", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            {t === "income" ? "Transactions" : "Expenses"}
          </button>
        ))}
      </div>

      {tab === "income" ? (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: "#fafaf8", borderBottom: "2px solid #e8e6e1" }}>
              {["Client", "Property", "Sale price", "Rate", "Brokerage", "Net commission", "GST collected", "Closing date", "Status", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#94a3b8", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{transactions.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No transactions yet.</td></tr>
            ) : transactions.map((t) => {
              const gross = t.sale_price * (t.commission_rate / 100);
              const net = gross * (1 - (t.brokerage_split || 0) / 100);
              return (
                <tr key={t.id} style={{ borderBottom: "1px solid #f5f4f1" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 500 }}>{t.client_name || "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#64748b" }}>{t.address}</td>
                  <td style={{ padding: "10px 14px" }}>{fmt(t.sale_price)}</td>
                  <td style={{ padding: "10px 14px", color: "#64748b" }}>{t.commission_rate}%</td>
                  <td style={{ padding: "10px 14px", color: "#64748b" }}>{t.brokerage_split}%</td>
                  <td style={{ padding: "10px 14px", color: "#059669", fontWeight: 600 }}>{fmtDec(net)}</td>
                  <td style={{ padding: "10px 14px", color: "#6366f1" }}>{fmtDec(t.gst_collected)}</td>
                  <td style={{ padding: "10px 14px", color: "#64748b" }}>{t.closing_date || "—"}</td>
                  <td style={{ padding: "10px 14px" }}><Badge color={t.status === "closed" ? "#059669" : "#f59e0b"}>{t.status}</Badge></td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => delTx.mutate(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}><Icon name="trash" size={14} /></button>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: "#fafaf8", borderBottom: "2px solid #e8e6e1" }}>
              {["Date", "Category", "Description", "Amount", "GST paid", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#94a3b8", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{expenses.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No expenses yet.</td></tr>
            ) : expenses.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #f5f4f1" }}>
                <td style={{ padding: "10px 14px", color: "#64748b" }}>{e.date}</td>
                <td style={{ padding: "10px 14px" }}><Badge color="#6366f1">{e.category}</Badge></td>
                <td style={{ padding: "10px 14px", color: "#475569" }}>{e.description}</td>
                <td style={{ padding: "10px 14px", color: "#dc2626", fontWeight: 600 }}>{fmtDec(e.amount)}</td>
                <td style={{ padding: "10px 14px", color: "#64748b" }}>{fmtDec(e.gst_paid)}</td>
                <td style={{ padding: "10px 14px" }}>
                  <button onClick={() => delExp.mutate(e.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}><Icon name="trash" size={14} /></button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal open={showAddTx} onClose={() => setShowAddTx(false)} title="Add transaction" wide>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Select label="Client" value={txForm.client_id} onChange={setTx("client_id")} options={[{ value: "", label: "— No client —" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]} />
          <Input label="Property address" value={txForm.address} onChange={setTx("address")} placeholder="123 Maple Dr NW" />
          <Input label="Sale price ($)" type="number" value={txForm.sale_price} onChange={setTx("sale_price")} />
          <Input label="Commission rate (%)" type="number" step="0.1" value={txForm.commission_rate} onChange={setTx("commission_rate")} />
          <Input label="Brokerage split (%)" type="number" value={txForm.brokerage_split} onChange={setTx("brokerage_split")} />
          <Input label="GST/HST collected ($)" type="number" value={txForm.gst_collected} onChange={setTx("gst_collected")} />
          <Input label="Closing date" type="date" value={txForm.closing_date} onChange={setTx("closing_date")} />
          <Select label="Status" value={txForm.status} onChange={setTx("status")} options={["pending","closed"]} />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn onClick={() => setShowAddTx(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={() => addTx.mutate({ ...txForm, sale_price: +txForm.sale_price, commission_rate: +txForm.commission_rate, brokerage_split: +txForm.brokerage_split, gst_collected: +txForm.gst_collected })} disabled={!txForm.address || !txForm.sale_price}>Save</Btn>
        </div>
      </Modal>

      {/* Add Expense Modal */}
      <Modal open={showAddExp} onClose={() => setShowAddExp(false)} title="Add expense">
        <Input label="Date" type="date" value={expForm.date} onChange={setExp("date")} />
        <Select label="Category" value={expForm.category} onChange={setExp("category")} options={EXPENSE_CATS} />
        <Input label="Description" value={expForm.description} onChange={setExp("description")} placeholder="Facebook ads - March" />
        <Input label="Amount ($)" type="number" step="0.01" value={expForm.amount} onChange={setExp("amount")} />
        <Input label="GST/HST paid ($)" type="number" step="0.01" value={expForm.gst_paid} onChange={setExp("gst_paid")} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <Btn onClick={() => setShowAddExp(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={() => addExp.mutate({ ...expForm, amount: +expForm.amount, gst_paid: +expForm.gst_paid })} disabled={!expForm.date || !expForm.amount}>Save</Btn>
        </div>
      </Modal>
    </div>
  );
}
