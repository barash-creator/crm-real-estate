import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { clientsApi } from "../api/clients.js";
import Modal from "../components/Modal.jsx";
import Btn from "../components/Btn.jsx";
import { Input, Select } from "../components/Input.jsx";
import { STAGES } from "../constants/stages.js";

const DEFAULT = { name: "", email: "", phone: "", type: "buyer", stage: "lead", budget: "", address: "" };

export default function AddClientModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(DEFAULT);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => {
      setForm(DEFAULT);
      onSuccess?.();
    },
  });

  function handleClose() {
    setForm(DEFAULT);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add new client">
      <Input label="Full name *" value={form.name} onChange={set("name")} placeholder="Sarah Chen" required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="sarah@email.com" />
        <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="403-555-0000" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <Select label="Type *" value={form.type} onChange={set("type")} options={[{ value: "buyer", label: "Buyer" }, { value: "seller", label: "Seller" }]} />
        <Select label="Stage" value={form.stage} onChange={set("stage")} options={STAGES.map((s) => ({ value: s.id, label: s.label }))} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <Input label="Budget / listing price ($)" type="number" value={form.budget} onChange={set("budget")} placeholder="650000" />
        <Input label="Property address" value={form.address} onChange={set("address")} placeholder="123 Maple Dr NW" />
      </div>

      {mutation.error && (
        <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 10 }}>
          {mutation.error.response?.data?.error || "Failed to create client"}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn onClick={handleClose}>Cancel</Btn>
        <Btn variant="primary"
          onClick={() => mutation.mutate({ ...form, budget: form.budget ? +form.budget : 0 })}
          disabled={!form.name || mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Add client"}
        </Btn>
      </div>
    </Modal>
  );
}
