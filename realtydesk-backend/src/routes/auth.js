import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/v1/auth/register
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("full_name").trim().notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password, full_name } = req.body;

      const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (exists.rows.length) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const password_hash = await bcrypt.hash(password, 12);
      const { rows } = await pool.query(
        "INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at",
        [email, password_hash, full_name]
      );
      const user = rows[0];

      await pool.query(
        "INSERT INTO user_settings (user_id) VALUES ($1)",
        [user.id]
      );

      res.status(201).json({ token: signToken(user), user });
    } catch (err) { next(err); }
  }
);

// POST /api/v1/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const { rows } = await pool.query(
        "SELECT id, email, full_name, password_hash FROM users WHERE email = $1",
        [email]
      );
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const { password_hash: _, ...safeUser } = user;
      res.json({ token: signToken(safeUser), user: safeUser });
    } catch (err) { next(err); }
  }
);

// GET /api/v1/auth/me
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, email, full_name, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;
