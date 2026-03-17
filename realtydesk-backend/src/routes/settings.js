import { Router } from "express";
import { body } from "express-validator";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const VALID_PROVINCES = ["AB","BC","MB","SK","ON","QC","NB","NL","NS","PE","NT","NU","YT"];

const router = Router();
router.use(requireAuth);

// GET /api/v1/settings
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT province, google_calendar_token, google_drive_token, updated_at FROM user_settings WHERE user_id = $1",
      [req.user.id]
    );
    // Return settings without exposing raw tokens to frontend (just connected status)
    const s = rows[0] || { province: "AB" };
    res.json({
      province: s.province,
      google_calendar_connected: !!s.google_calendar_token,
      google_drive_connected: !!s.google_drive_token,
      updated_at: s.updated_at,
    });
  } catch (err) { next(err); }
});

// PUT /api/v1/settings
router.put(
  "/",
  [body("province").optional().isIn(VALID_PROVINCES)],
  validate,
  async (req, res, next) => {
    try {
      const { province } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO user_settings (user_id, province) VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET province = $2, updated_at = NOW()
         RETURNING province, updated_at`,
        [req.user.id, province]
      );
      res.json(rows[0]);
    } catch (err) { next(err); }
  }
);

export default router;
