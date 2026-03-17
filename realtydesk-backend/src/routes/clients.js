import { Router } from "express";
import { body, param } from "express-validator";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

const VALID_STAGES = ["lead","consultation","preapproval","active","offer","conditional","firm","closed"];

// GET /api/v1/clients
router.get("/", async (req, res, next) => {
  try {
    const { search, stage, type } = req.query;
    let q = "SELECT * FROM clients WHERE user_id = $1";
    const params = [req.user.id];

    if (stage) { params.push(stage); q += ` AND stage = $${params.length}`; }
    if (type)  { params.push(type);  q += ` AND type = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      q += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR address ILIKE $${params.length})`;
    }
    q += " ORDER BY created_at DESC";

    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/v1/clients
router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("type").isIn(["buyer", "seller"]),
    body("stage").optional().isIn(VALID_STAGES),
    body("budget").optional().isNumeric(),
    body("email").optional().isEmail().normalizeEmail(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, phone, type, stage = "lead", budget = 0, address = "", google_drive_folder = "" } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO clients (user_id, name, email, phone, type, stage, budget, address, google_drive_folder)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [req.user.id, name, email || null, phone || null, type, stage, budget, address, google_drive_folder]
      );
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

// GET /api/v1/clients/:id  (includes notes)
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM clients WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Client not found" });

    const { rows: notes } = await pool.query(
      "SELECT * FROM client_notes WHERE client_id = $1 ORDER BY created_at ASC",
      [req.params.id]
    );
    res.json({ ...rows[0], notes });
  } catch (err) { next(err); }
});

// PUT /api/v1/clients/:id
router.put(
  "/:id",
  [
    body("type").optional().isIn(["buyer", "seller"]),
    body("stage").optional().isIn(VALID_STAGES),
    body("budget").optional().isNumeric(),
    body("email").optional().isEmail().normalizeEmail(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const allowed = ["name","email","phone","type","stage","budget","address","google_drive_folder"];
      const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
      if (!Object.keys(updates).length) return res.status(400).json({ error: "No valid fields to update" });

      const sets = Object.keys(updates).map((k, i) => `${k} = $${i + 3}`).join(", ");
      const vals = Object.values(updates);

      const { rows } = await pool.query(
        `UPDATE clients SET ${sets}, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id, ...vals]
      );
      if (!rows[0]) return res.status(404).json({ error: "Client not found" });
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// PATCH /api/v1/clients/:id/stage
router.patch(
  "/:id/stage",
  [body("stage").isIn(VALID_STAGES)],
  validate,
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        "UPDATE clients SET stage = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *",
        [req.body.stage, req.params.id, req.user.id]
      );
      if (!rows[0]) return res.status(404).json({ error: "Client not found" });
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/clients/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM clients WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Client not found" });
    res.status(204).end();
  } catch (err) { next(err); }
});

// POST /api/v1/clients/:id/notes
router.post(
  "/:id/notes",
  [body("body").trim().notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      // Verify client belongs to user
      const { rows: c } = await pool.query(
        "SELECT id FROM clients WHERE id = $1 AND user_id = $2",
        [req.params.id, req.user.id]
      );
      if (!c[0]) return res.status(404).json({ error: "Client not found" });

      const { rows } = await pool.query(
        "INSERT INTO client_notes (client_id, user_id, body) VALUES ($1,$2,$3) RETURNING *",
        [req.params.id, req.user.id, req.body.body]
      );
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/clients/:id/notes/:noteId
router.delete("/:id/notes/:noteId", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM client_notes WHERE id = $1 AND client_id = $2 AND user_id = $3",
      [req.params.noteId, req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Note not found" });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
