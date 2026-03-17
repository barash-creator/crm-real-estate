import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../api/clients.js";
import { meetingsApi } from "../api/meetings.js";
import { documentsApi } from "../api/documents.js";
import { STAGES } from "../constants/stages.js";
import Badge from "../components/Badge.jsx";
import Btn from "../components/Btn.jsx";
import Icon from "../components/Icon.jsx";
import Modal from "../components/Modal.jsx";
import { Input, Select } from "../components/Input.jsx";
import { fmt } from "../utils/format.js";
import { MEETING_TYPES, DOC_CATEGORIES } from "../constants/expenses.js";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const [showMeeting, setShowMeeting] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: "", datetime: "", type: "showing", duration_minutes: 60 });
  const [docForm, setDocForm] = useState({ name: "", category: "Legal", date: "", drive_link: "" });

  const { data: client, isLoading } = useQuery({ queryKey: ["client", id], queryFn: () => clientsApi.getOne(id) });
  const { data: meetings = [] } = useQuery({ queryKey: ["meetings", id], queryFn: () => meetingsApi.getAll({ clientId: id }) });
  const { data: documents = [] } = useQuery({ queryKey: ["documents", id], queryFn: () => documentsApi.getAll({ clientId: id }) });

  const stageMut = useMutation({ mutationFn: (stage) => clientsApi.updateStage(id, stage), onSuccess: () => qc.invalidateQueries({ queryKey: ["client", id] }) });
  const addNote = useMutation({ mutationFn: (body) => clientsApi.addNote(id, body), onSuccess: () => { setNoteText(""); qc.invalidateQueries({ queryKey: ["client", id] }); } });
  const delNote = useMutation({ mutationFn: (noteId) => clientsApi.deleteNote(id, noteId), onSuccess: () => qc.invalidateQueries({ queryKey: ["client", id] }) });
  const addMeeting = useMutation({ mutationFn: (data) => meetingsApi.create({ ...data, client_id: id }), onSuccess: () => { setShowMeeting(false); qc.invalidateQueries({ queryKey: ["meetings", id] }); } });
  const delMeeting = useMutation({ mutationFn: (mid) => meetingsApi.remove(mid), onSuccess: () => qc.invalidateQueries({ queryKey: ["meetings", id] }) });
  const addDoc = useMutation({ mutationFn: (data) => documentsApi.create({ ...data, client_id: id }), onSuccess: () => { setShowDoc(false); qc.invalidateQueries({ queryKey: ["documents", id] }); } });
  const delDoc = useMutation({ mutationFn: (did) => documentsApi.remove(did), onSuccess: () => qc.invalidateQueries({ queryKey: ["documents", id] }) });

  if (isLoading) return <div style={{ color: "#94a3b8", padding: 40 }}>Loading...</div>;
  if (!client)   return <div style={{ color: "#dc2626", padding: 40 }}>Client not found.</div>;

  const stageIndex = STAGES.findIndex((s) => s.id === client.stage);
  const stageColor = STAGES[stageIndex]?.color || "#94a3b8";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <button onClick={() => navigate("/clients")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
          <Icon name="chevLeft" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{client.name}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <Badge color={client.type === "buyer" ? "#3b82f6" : "#8b5cf6"}>{client.type}</Badge>
            <Badge color={stageColor}>{STAGES[stageIndex]?.label || client.stage}</Badge>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Contact info */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Contact</h3>
          {[["Email", client.email, "mail"], ["Phone", client.phone, "phone"], ["Address", client.address, "home"], ["Budget", client.budget ? fmt(client.budget) : null, "dollar"]].map(([label, val, icon]) =>
            val ? (
              <div key={label} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <Icon name={icon} />
                <div><div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div style={{ fontSize: 14, color: "#1a1a2e" }}>{val}</div></div>
              </div>
            ) : null
          )}
        </div>

        {/* Stage pipeline */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Pipeline stage</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {STAGES.map((s, i) => (
              <button key={s.id} onClick={() => stageMut.mutate(s.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8,
                border: "none", cursor: "pointer", textAlign: "left",
                background: s.id === client.stage ? s.color + "15" : "transparent",
                color: s.id === client.stage ? s.color : "#64748b",
                fontWeight: s.id === client.stage ? 600 : 400, fontSize: 13,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: i <= stageIndex ? s.color : "#e8e6e1", flexShrink: 0 }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Notes</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input value={noteText} onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && noteText.trim() && addNote.mutate(noteText.trim())}
              placeholder="Add a note and press Enter..."
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e0db", fontSize: 13, outline: "none" }} />
            <Btn onClick={() => noteText.trim() && addNote.mutate(noteText.trim())} disabled={!noteText.trim()}>Add</Btn>
          </div>
          {(client.notes || []).map((note) => (
            <div key={note.id} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #f1f0ec" }}>
              <div style={{ flex: 1, fontSize: 13, color: "#475569" }}>{note.body}</div>
              <button onClick={() => delNote.mutate(note.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 2 }}>
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Meetings */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: 0 }}>Meetings</h3>
            <Btn onClick={() => setShowMeeting(true)}><Icon name="plus" size={14} /> Add</Btn>
          </div>
          {meetings.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 13 }}>No meetings scheduled.</p> : meetings.map((m) => (
            <div key={m.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f0ec", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{m.title}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(m.datetime).toLocaleString("en-CA")} · {m.duration_minutes}min</div>
              </div>
              <Badge color={m.type === "showing" ? "#3b82f6" : "#8b5cf6"}>{m.type}</Badge>
              <button onClick={() => delMeeting.mutate(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", padding: 24, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: 0 }}>Documents</h3>
            <Btn onClick={() => setShowDoc(true)}><Icon name="plus" size={14} /> Add</Btn>
          </div>
          {documents.length === 0 ? <p style={{ color: "#94a3b8", fontSize: 13 }}>No documents attached.</p> : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {documents.map((d) => (
                <div key={d.id} style={{ background: "#fafaf8", borderRadius: 10, border: "1px solid #e8e6e1", padding: "10px 14px", display: "flex", gap: 10, alignItems: "center", minWidth: 200 }}>
                  <Icon name="file" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{d.category} · {d.date}</div>
                    {d.drive_link && <a href={d.drive_link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#c8a45a" }}>Open in Drive</a>}
                  </div>
                  <button onClick={() => delDoc.mutate(d.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add meeting modal */}
      <Modal open={showMeeting} onClose={() => setShowMeeting(false)} title="Schedule meeting">
        <Input label="Title" value={meetingForm.title} onChange={(e) => setMeetingForm((f) => ({ ...f, title: e.target.value }))} placeholder="Property showing at 123 Main St" />
        <Input label="Date & time" type="datetime-local" value={meetingForm.datetime} onChange={(e) => setMeetingForm((f) => ({ ...f, datetime: e.target.value }))} />
        <Select label="Type" value={meetingForm.type} onChange={(e) => setMeetingForm((f) => ({ ...f, type: e.target.value }))} options={MEETING_TYPES} />
        <Input label="Duration (minutes)" type="number" value={meetingForm.duration_minutes} onChange={(e) => setMeetingForm((f) => ({ ...f, duration_minutes: +e.target.value }))} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <Btn onClick={() => setShowMeeting(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={() => addMeeting.mutate(meetingForm)} disabled={!meetingForm.title || !meetingForm.datetime}>Save</Btn>
        </div>
      </Modal>

      {/* Add document modal */}
      <Modal open={showDoc} onClose={() => setShowDoc(false)} title="Add document">
        <Input label="Document name" value={docForm.name} onChange={(e) => setDocForm((f) => ({ ...f, name: e.target.value }))} placeholder="Purchase Agreement" />
        <Select label="Category" value={docForm.category} onChange={(e) => setDocForm((f) => ({ ...f, category: e.target.value }))} options={DOC_CATEGORIES} />
        <Input label="Date" type="date" value={docForm.date} onChange={(e) => setDocForm((f) => ({ ...f, date: e.target.value }))} />
        <Input label="Google Drive link (optional)" value={docForm.drive_link} onChange={(e) => setDocForm((f) => ({ ...f, drive_link: e.target.value }))} placeholder="https://drive.google.com/..." />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <Btn onClick={() => setShowDoc(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={() => addDoc.mutate(docForm)} disabled={!docForm.name}>Save</Btn>
        </div>
      </Modal>
    </div>
  );
}
