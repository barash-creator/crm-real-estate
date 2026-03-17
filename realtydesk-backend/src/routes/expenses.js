import { Router } from "express";
import { body } from "express-validator";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

// GET /api/v1/expenses?year=&category=
router.get("/", async (req, res, next) => {
  try {
    const { year, category } = req.query;
    let q = "SELECT * FROM expenses WHERE user_id = $1";
    const params = [req.user.id];

    if (year)     { params.push(year);     q += ` AND EXTRACT(YEAR FROM date) = $${params.length}`; }
    if (category) { params.push(category); q += ` AND category = $${params.length}`; }
    q += " ORDER BY date DESC";

    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/v1/expenses
router.post(
  "/",
  [
    body("date").isDate(),
    body("category").trim().notEmpty(),
    body("amount").isNumeric(),
    body("gst_paid").optional().isNumeric(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { date, category, description = "", amount, gst_paid = 0 } = req.body;
      const { rows } = await pool.query(
        "INSERT INTO expenses (user_id, date, category, description, amount, gst_paid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
        [req.user.id, date, category, description, amount, gst_paid]
      );
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  }
);

// PUT /api/v1/expenses/:id
router.put(
  "/:id",
  [
    body("date").optional().isDate(),
    body("amount").optional().isNumeric(),
    body("gst_paid").optional().isNumeric(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const allowed = ["date","category","description","amount","gst_paid"];
      const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
      if (!Object.keys(updates).length) return res.status(400).json({ error: "No valid fields to update" });

      const sets = Object.keys(updates).map((k, i) => `${k} = $${i + 3}`).join(", ");
      const { rows } = await pool.query(
        `UPDATE expenses SET ${sets} WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id, ...Object.values(updates)]
      );
      if (!rows[0]) return res.status(404).json({ error: "Expense not found" });
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

// DELETE /api/v1/expenses/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Expense not found" });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
