import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth.js";
import clientsRouter from "./routes/clients.js";
import transactionsRouter from "./routes/transactions.js";
import expensesRouter from "./routes/expenses.js";
import meetingsRouter from "./routes/meetings.js";
import documentsRouter from "./routes/documents.js";
import settingsRouter from "./routes/settings.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());

// ── Rate limiting (auth routes only) ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/clients", clientsRouter);
app.use("/api/v1/transactions", transactionsRouter);
app.use("/api/v1/expenses", expensesRouter);
app.use("/api/v1/meetings", meetingsRouter);
app.use("/api/v1/documents", documentsRouter);
app.use("/api/v1/settings", settingsRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`RealtyDesk API running on port ${PORT}`);
});
