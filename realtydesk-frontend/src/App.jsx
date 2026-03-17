import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./components/Layout/AppLayout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import Clients from "./pages/Clients.jsx";
import ClientDetail from "./pages/ClientDetail.jsx";
import Calendar from "./pages/Calendar.jsx";
import Accounting from "./pages/Accounting.jsx";
import TaxCalculator from "./pages/TaxCalculator.jsx";
import Settings from "./pages/Settings.jsx";

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#94a3b8" }}>
      Loading...
    </div>
  );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/pipeline"    element={<Pipeline />} />
          <Route path="/clients"     element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/calendar"    element={<Calendar />} />
          <Route path="/accounting"  element={<Accounting />} />
          <Route path="/tax"         element={<TaxCalculator />} />
          <Route path="/settings"    element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
