import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Btn from "../components/Btn.jsx";
import { Input } from "../components/Input.jsx";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.full_name);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a2e" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "40px 48px", width: 420, maxWidth: "95vw" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#c8a45a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>R</span>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>RealtyDesk Canada</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Real Estate CRM & Accounting</div>
          </div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
          {mode === "login" ? "Sign in to your account" : "Create your account"}
        </h2>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <Input label="Full name" value={form.full_name} onChange={set("full_name")} placeholder="Alex Realty" required />
          )}
          <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="agent@brokerage.ca" required />
          <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder={mode === "register" ? "Min 8 characters" : "••••••••"} required />

          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <Btn variant="primary" style={{ width: "100%", justifyContent: "center", padding: "12px 18px", fontSize: 14 }} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </Btn>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748b" }}>
          {mode === "login" ? (
            <>Don&apos;t have an account?{" "}
              <button onClick={() => setMode("register")} style={{ background: "none", border: "none", color: "#c8a45a", fontWeight: 600, cursor: "pointer" }}>Sign up</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "#c8a45a", fontWeight: 600, cursor: "pointer" }}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
