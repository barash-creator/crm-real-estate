import { Router } from "express";
import { body } from "express-validator";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

const VALID_TYPES = ["showing","consultation","closing","inspection","other"];

// GET /api/v1/meetings?clientId=&from=&to=
router.get("/", async (req, res, next) => {
  try {
    const { clientId, from, to } = req.query;
    let q = `SELECT m.*, c.name AS client_name
             FROM meetings m
             LEFT JOIN clients c ON c.id = m.client_id
             WHERE m.user_id = $1`;
    const params = [req.user.id];

    if (clientId) { params.push(clientId); q += ` AND m.client_id = $${params.length}`; }
    if (from)     { params.push(from);     q += ` AND m.datetime >= $${params.length}`; }
    if (to)       { params.push(to);       q += ` AND m.datetime <= $${params.length}`; }
    q += " ORDER BY m.datetime ASC";

    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/v1/meetings
router.post(
  "/",
  [
    body("title").trim().notEmpty(),
    body("datetime").isISO8601(),
    body("type").isIn(VALID_TYPES),
    body("duration_minutes").optional().isInt({ min: 1 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { client_id, title, datetime, duration_minutes = 60, type, google_calendar_event_id } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO meetings (user_id, client_id, title, datetime, duration_minutes, type, google_calendar_event_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [req.user.id, client_id || null, title, datetime, duration_minutes, type, google_calendar_event_id || null]
      );
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

// PUT /api/v1/meetings/:id
router.put(
  "/:id",
  [
    body("datetime").optional().isISO8601(),
    body("type").optional().isIn(VALID_TYPES),
    body("duration_minutes").optional().isInt({ min: 1 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const allowed = ["client_id","title","datetime","duration_minutes","type","google_calendar_event_id"];
      const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
      if (!Object.keys(updates).length) return res.status(400).json({ error: "No valid fields to update" });

      const sets = Object.keys(updates).map((k, i) => `${k} = $${i + 3}`).join(", ");
      const { rows } = await pool.query(
        `UPDATE meetings SET ${sets} WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id, ...Object.values(updates)]
      );
      if (!rows[0]) return res.status(404).json({ error: "Meeting not found" });
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/meetings/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM meetings WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Meeting not found" });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
