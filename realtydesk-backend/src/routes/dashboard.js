import { Router } from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/v1/dashboard
// Returns all stats needed for the Dashboard page in a single round-trip.
router.get("/", async (req, res, next) => {
  try {
    const uid = req.user.id;

    const { rows } = await pool.query(`
      WITH
        revenue AS (
          SELECT COALESCE(SUM(
            sale_price * (commission_rate / 100.0) * (1 - COALESCE(brokerage_split, 0) / 100.0)
          ), 0) AS total
          FROM transactions
          WHERE user_id = $1 AND status = 'closed'
        ),
        exp AS (
          SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = $1
        ),
        pipeline AS (
          SELECT stage, COUNT(*) AS count FROM clients WHERE user_id = $1 GROUP BY stage
        ),
        active AS (
          SELECT COUNT(*) AS count FROM clients
          WHERE user_id = $1 AND stage NOT IN ('lead', 'closed')
        ),
        upcoming_meetings AS (
          SELECT m.id, m.title, m.datetime, m.type, m.duration_minutes, c.name AS client_name
          FROM meetings m
          LEFT JOIN clients c ON c.id = m.client_id
          WHERE m.user_id = $1 AND m.datetime >= NOW()
          ORDER BY m.datetime ASC
          LIMIT 5
        ),
        recent_tx AS (
          SELECT t.id, t.address, t.sale_price, t.commission_rate, t.brokerage_split,
                 t.closing_date, t.status, c.name AS client_name,
                 t.sale_price * (t.commission_rate / 100.0) * (1 - COALESCE(t.brokerage_split,0)/100.0) AS net_commission
          FROM transactions t
          LEFT JOIN clients c ON c.id = t.client_id
          WHERE t.user_id = $1
          ORDER BY t.created_at DESC
          LIMIT 5
        )
      SELECT
        (SELECT total FROM revenue)                                     AS total_revenue,
        (SELECT total FROM exp)                                         AS total_expenses,
        (SELECT count FROM active)                                      AS active_deals,
        (SELECT COUNT(*) FROM clients WHERE user_id = $1)              AS total_clients,
        (SELECT json_agg(row_to_json(pipeline)) FROM pipeline)         AS pipeline_snapshot,
        (SELECT json_agg(row_to_json(upcoming_meetings)) FROM upcoming_meetings) AS upcoming_meetings,
        (SELECT json_agg(row_to_json(recent_tx)) FROM recent_tx)       AS recent_transactions
    `, [uid]);

    const d = rows[0];
    res.json({
      totalRevenue: parseFloat(d.total_revenue),
      totalExpenses: parseFloat(d.total_expenses),
      netIncome: parseFloat(d.total_revenue) - parseFloat(d.total_expenses),
      activeDeals: parseInt(d.active_deals),
      totalClients: parseInt(d.total_clients),
      pipelineSnapshot: d.pipeline_snapshot || [],
      upcomingMeetings: d.upcoming_meetings || [],
      recentTransactions: d.recent_transactions || [],
    });
  } catch (err) { next(err); }
});

export default router;
