import { Router } from "express";
import { body } from "express-validator";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

// GET /api/v1/transactions?clientId=&status=&year=
router.get("/", async (req, res, next) => {
  try {
    const { clientId, status, year } = req.query;
    let q = `SELECT t.*, c.name AS client_name
             FROM transactions t
             LEFT JOIN clients c ON c.id = t.client_id
             WHERE t.user_id = $1`;
    const params = [req.user.id];

    if (clientId) { params.push(clientId); q += ` AND t.client_id = $${params.length}`; }
    if (status)   { params.push(status);   q += ` AND t.status = $${params.length}`; }
    if (year)     { params.push(year);     q += ` AND EXTRACT(YEAR FROM t.created_at) = $${params.length}`; }
    q += " ORDER BY t.created_at DESC";

    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/v1/transactions
router.post(
  "/",
  [
    body("address").trim().notEmpty(),
    body("sale_price").isNumeric(),
    body("commission_rate").isNumeric(),
    body("brokerage_split").optional().isNumeric(),
    body("gst_collected").optional().isNumeric(),
    body("status").optional().isIn(["pending", "closed"]),
    body("closing_date").optional().isDate(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { client_id, address, sale_price, commission_rate, brokerage_split = 0, gst_collected = 0, closing_date, status = "pending" } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO transactions (user_id, client_id, address, sale_price, commission_rate, brokerage_split, gst_collected, closing_date, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [req.user.id, client_id || null, address, sale_price, commission_rate, brokerage_split, gst_collected, closing_date || null, status]
      );
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

// GET /api/v1/transactions/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM transactions WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Transaction not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/v1/transactions/:id
router.put(
  "/:id",
  [
    body("sale_price").optional().isNumeric(),
    body("commission_rate").optional().isNumeric(),
    body("brokerage_split").optional().isNumeric(),
    body("gst_collected").optional().isNumeric(),
    body("status").optional().isIn(["pending", "closed"]),
    body("closing_date").optional().isDate(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const allowed = ["client_id","address","sale_price","commission_rate","brokerage_split","gst_collected","closing_date","status"];
      const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
      if (!Object.keys(updates).length) return res.status(400).json({ error: "No valid fields to update" });

      const sets = Object.keys(updates).map((k, i) => `${k} = $${i + 3}`).join(", ");
      const { rows } = await pool.query(
        `UPDATE transactions SET ${sets}, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id, ...Object.values(updates)]
      );
      if (!rows[0]) return res.status(404).json({ error: "Transaction not found" });
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/transactions/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Transaction not found" });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
