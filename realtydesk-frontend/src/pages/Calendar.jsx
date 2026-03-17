import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { meetingsApi } from "../api/meetings.js";
import Badge from "../components/Badge.jsx";
import Icon from "../components/Icon.jsx";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function meetingColor(type) {
  const map = { showing: "#3b82f6", consultation: "#8b5cf6", closing: "#059669", inspection: "#f59e0b", other: "#64748b" };
  return map[type] || "#6366f1";
}

export default function Calendar() {
  const navigate = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const from = new Date(year, month, 1).toISOString();
  const to   = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings", "calendar", year, month],
    queryFn: () => meetingsApi.getAll({ from, to }),
  });

  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();

  const meetingsForDay = (day) =>
    meetings.filter((m) => new Date(m.datetime).getDate() === day && new Date(m.datetime).getMonth() === month);

  function prev() { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); }
  function next() { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(d);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Calendar</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prev} style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}><Icon name="chevLeft" /></button>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", minWidth: 150, textAlign: "center" }}>{MONTHS[month]} {year}</span>
          <button onClick={next} style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}><Icon name="chevRight" /></button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e1", overflow: "hidden" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #e8e6e1" }}>
          {DAYS.map((d) => (
            <div key={d} style={{ padding: "12px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{d}</div>
          ))}
        </div>
        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((day, i) => {
            const dayMeetings = day ? meetingsForDay(day) : [];
            const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            return (
              <div key={i} style={{ minHeight: 100, padding: "8px 6px", borderRight: "1px solid #f1f0ec", borderBottom: "1px solid #f1f0ec", background: day ? "#fff" : "#fafaf8" }}>
                {day && (
                  <>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: isToday ? "#c8a45a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "#fff" : "#475569" }}>{day}</span>
                    </div>
                    {dayMeetings.slice(0, 3).map((m) => (
                      <div key={m.id} onClick={() => m.client_id && navigate(`/clients/${m.client_id}`)}
                        style={{ background: meetingColor(m.type) + "15", borderLeft: `3px solid ${meetingColor(m.type)}`, borderRadius: "0 4px 4px 0", padding: "2px 6px", marginBottom: 3, cursor: m.client_id ? "pointer" : "default" }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: meetingColor(m.type), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {new Date(m.datetime).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })} {m.title}
                        </div>
                      </div>
                    ))}
                    {dayMeetings.length > 3 && <div style={{ fontSize: 10, color: "#94a3b8" }}>+{dayMeetings.length - 3} more</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
        {[["showing","#3b82f6"], ["consultation","#8b5cf6"], ["closing","#059669"], ["inspection","#f59e0b"], ["other","#64748b"]].map(([type, color]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
