import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../db.js";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendChangePasswordEmail,
  sendChangeEmailEmail,
} from "../services/email.services.js";

const router = express.Router();

/*SIGN UP*/
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Усі поля обовʼязкові" });
    }

    const emailClean = email.trim().toLowerCase();
    const username = emailClean.split("@")[0];

    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [emailClean],
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Електронна пошта вже існує" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (username, email, password, activation_token)
       VALUES ($1, $2, $3, $4)`,
      [username, emailClean, hashedPassword, activationToken],
    );

    await sendActivationEmail(emailClean, activationToken);

    res.status(201).json({ message: "Перевірте пошту для активації акаунту" });
  } catch (e) {
    console.error("SIGNUP ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/*ACTIVATE ACCOUNT*/
router.get("/activate/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      "SELECT id FROM users WHERE activation_token = $1",
      [token],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid token" });
    }

    await pool.query(
      `UPDATE users
       SET is_activated = true,
           activation_token = NULL
       WHERE activation_token = $1`,
      [token],
    );

    const clientHost = process.env.CLIENT_HOST || "http://localhost:3000";
    res.redirect(`${clientHost}/account-activated`);
  } catch (e) {
    console.error("ACTIVATION ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/*LOGIN*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Усі поля обовʼязкові" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "SERVER_MISCONFIGURED" });
    }

    const emailClean = email.trim().toLowerCase();

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [emailClean],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "EMAIL_NOT_FOUND" });
    }

    const user = result.rows[0];

    if (!user.is_activated) {
      return res.status(403).json({ message: "Активуйте акаунт через email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "WRONG_PASSWORD" });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
        issuer: "your-app",
        audience: "your-app-users",
      },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/*FORGOT PASSWORD*/
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const emailClean = email?.trim().toLowerCase();

    if (!emailClean) {
      return res.status(400).json({ message: "EMAIL_REQUIRED" });
    }

    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [emailClean],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "EMAIL_NOT_FOUND" });
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 15);

    await pool.query(
      `UPDATE users
       SET reset_password_token = $1,
           reset_password_expires = $2
       WHERE email = $3`,
      [token, expires, emailClean],
    );

    await sendResetPasswordEmail(emailClean, token);

    res.json({ message: "EMAIL_SENT" });
  } catch (e) {
    console.error("FORGOT PASSWORD ERROR:", e);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
});

/*RESET PASSWORD*/
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "INVALID_PASSWORD" });
    }

    const result = await pool.query(
      `SELECT id FROM users
       WHERE reset_password_token = $1
         AND reset_password_expires > NOW()`,
      [token],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "TOKEN_INVALID_OR_EXPIRED" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users
       SET password = $1,
           reset_password_token = NULL,
           reset_password_expires = NULL
       WHERE id = $2`,
      [hashedPassword, result.rows[0].id],
    );

    res.json({ message: "PASSWORD_CHANGED" });
  } catch (e) {
    console.error("RESET PASSWORD ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/*GET PROFILE*/
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, phone, address,
              TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, gender
       FROM users WHERE id = $1`,
      [req.user.id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }

    res.json(result.rows[0]);
  } catch (e) {
    console.error("GET PROFILE ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/*UPDATE PROFILE*/
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      address,
      birth_date,
      gender,
    } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET first_name = $1,
           last_name  = $2,
           phone      = $3,
           address    = $4,
           birth_date = $5,
           gender     = $6
       WHERE id = $7
       RETURNING id, first_name, last_name, email, phone, address,
                 TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, gender`,
      [
        first_name,
        last_name,
        phone,
        address,
        birth_date,
        gender,
        req.user.id,
      ],
    );

    res.json(result.rows[0]);
  } catch (e) {
    console.error("UPDATE PROFILE ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/*CHANGE PASSWORD (EMAIL CONFIRM FLOW)*/
router.post("/request-change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "INVALID_NEW_PASSWORD" });
    }

    const result = await pool.query(
      "SELECT email, password FROM users WHERE id = $1",
      [req.user.id],
    );

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "WRONG_PASSWORD" });
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 15);
    const hashedNew = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET change_password_token = $1,
           change_password_expires = $2,
           pending_password = $3
       WHERE id = $4`,
      [token, expires, hashedNew, req.user.id],
    );

    await sendChangePasswordEmail(user.email, token);

    res.json({ message: "EMAIL_SENT" });
  } catch (e) {
    console.error("CHANGE PASSWORD ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/*CONFIRM CHANGE PASSWORD*/
router.get("/confirm-change-password/:token", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id FROM users
       WHERE change_password_token = $1
         AND change_password_expires > NOW()`,
      [req.params.token],
    );

    const clientHost = process.env.CLIENT_HOST || "http://localhost:3000";

    if (result.rows.length === 0) {
      return res.redirect(`${clientHost}/password-changed-invalid`);
    }

    await pool.query(
      `UPDATE users
       SET password = pending_password,
           pending_password = NULL,
           change_password_token = NULL,
           change_password_expires = NULL
       WHERE id = $1`,
      [result.rows[0].id],
    );

    res.redirect(`${clientHost}/password-changed-success`);
  } catch (e) {
    console.error("CONFIRM PASSWORD ERROR:", e);
    res.redirect(
      `${process.env.CLIENT_HOST || "http://localhost:3000"}/password-changed-invalid`,
    );
  }
});

/*CHANGE EMAIL (EMAIL CONFIRM FLOW)*/
router.post("/request-change-email", authMiddleware, async (req, res) => {
  try {
    const { newEmail, confirmEmail, password } = req.body;
    const userId = req.user.id;

    if (!newEmail || !confirmEmail || !password) {
      return res.status(400).json({ message: "ALL_FIELDS_REQUIRED" });
    }

    if (newEmail !== confirmEmail) {
      return res.status(400).json({ message: "EMAILS_DO_NOT_MATCH" });
    }

    const emailClean = newEmail.trim().toLowerCase();

    const userResult = await pool.query(
      "SELECT email, password FROM users WHERE id = $1",
      [userId],
    );

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "WRONG_PASSWORD" });
    }

    const exists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [emailClean],
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "EMAIL_ALREADY_USED" });
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 15);

    await pool.query(
      `UPDATE users
       SET pending_email = $1,
           change_email_token = $2,
           change_email_expires = $3
       WHERE id = $4`,
      [emailClean, token, expires, userId],
    );

    await sendChangeEmailEmail(emailClean, token);

    res.json({ message: "EMAIL_SENT" });
  } catch (e) {
    console.error("CHANGE EMAIL ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/*CONFIRM CHANGE EMAIL*/
router.get("/confirm-change-email/:token", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, pending_email FROM users
       WHERE change_email_token = $1
         AND change_email_expires > NOW()`,
      [req.params.token],
    );

    const clientHost = process.env.CLIENT_HOST || "http://localhost:3000";

    if (result.rows.length === 0) {
      return res.redirect(`${clientHost}/email-changed-invalid`);
    }

    const user = result.rows[0];

    await pool.query(
      `UPDATE users
       SET email = $1,
           pending_email = NULL,
           change_email_token = NULL,
           change_email_expires = NULL
       WHERE id = $2`,
      [user.pending_email, user.id],
    );

    res.redirect(`${clientHost}/email-changed-success`);
  } catch (e) {
    console.error("CONFIRM EMAIL ERROR:", e);
    res.redirect(
      `${process.env.CLIENT_HOST || "http://localhost:3000"}/email-changed-invalid`,
    );
  }
});

/*CHECK RESET TOKEN*/
router.get("/check-reset-token/:token", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id FROM users
       WHERE reset_password_token = $1
         AND reset_password_expires > NOW()`,
      [req.params.token],
    );

    res.json({ valid: result.rows.length > 0 });
  } catch (e) {
    console.error("CHECK RESET TOKEN ERROR:", e);
    res.status(500).json({ valid: false });
  }
});

export default router;
