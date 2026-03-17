import { Router } from "express";
import { body } from "express-validator";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

// GET /api/v1/documents?clientId=
router.get("/", async (req, res, next) => {
  try {
    const { clientId } = req.query;
    let q = `SELECT d.*, c.name AS client_name
             FROM documents d
             LEFT JOIN clients c ON c.id = d.client_id
             WHERE d.user_id = $1`;
    const params = [req.user.id];

    if (clientId) { params.push(clientId); q += ` AND d.client_id = $${params.length}`; }
    q += " ORDER BY d.created_at DESC";

    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/v1/documents
router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("category").trim().notEmpty(),
    body("date").optional().isDate(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { client_id, name, category, date, url, drive_link } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO documents (user_id, client_id, name, category, date, url, drive_link)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [req.user.id, client_id || null, name, category, date || new Date().toISOString().slice(0,10), url || null, drive_link || null]
      );
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/documents/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM documents WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Document not found" });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
