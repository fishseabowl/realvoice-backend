// src/routes/bets.js
import express from "express";
import db from "../models/db.js";

const router = express.Router();

// POST /api/bets  -> place a bet { questionId, optionId, amount }
router.post("/", (req, res) => {
  const { questionId, optionId, amount } = req.body;
  if (!questionId || !optionId || !amount || amount <= 0) {
    return res.status(400).json({ error: "Bad request: questionId, optionId, amount > 0" });
  }

  // Ensure option exists and belongs to question
  const opt = db.prepare("SELECT * FROM options WHERE id = ? AND question_id = ?").get(optionId, questionId);
  if (!opt) return res.status(404).json({ error: "Option not found for that question" });

  db.prepare("INSERT INTO bets (question_id, option_id, amount) VALUES (?, ?, ?)").run(questionId, optionId, amount);

  // update option aggregated value
  db.prepare("UPDATE options SET value = value + ? WHERE id = ?").run(amount, optionId);

  // return updated option and simple acknowledgment
  const updatedOpt = db.prepare("SELECT id, name, value FROM options WHERE id = ?").get(optionId);
  res.json({ success: true, option: updatedOpt });
});

// GET /api/bets  -> list bets (joined to show question/option)
router.get("/", (req, res) => {
  const bets = db.prepare(`
    SELECT b.id, b.amount, b.time,
           q.id AS question_id, q.text AS question_text,
           o.id AS option_id, o.name AS option_name
    FROM bets b
    JOIN questions q ON b.question_id = q.id
    JOIN options o ON b.option_id = o.id
    ORDER BY b.time DESC
  `).all();
  res.json(bets);
});

export default router;
