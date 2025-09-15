// src/routes/questions.js
import express from "express";
import db from "../models/db.js";

const router = express.Router();

// GET /api/questions  -> all questions with options
router.get("/", (req, res) => {
  const questions = db.prepare("SELECT * FROM questions").all();
  const result = questions.map(q => {
    const options = db.prepare("SELECT id, name, value FROM options WHERE question_id = ?").all(q.id);
    return { ...q, options };
  });
  res.json(result);
});

// GET /api/questions/:id -> single question with options
router.get("/:id", (req, res) => {
  const q = db.prepare("SELECT * FROM questions WHERE id = ?").get(req.params.id);
  if (!q) return res.status(404).json({ error: "Question not found" });
  const options = db.prepare("SELECT id, name, value FROM options WHERE question_id = ?").all(q.id);
  res.json({ ...q, options });
});

// POST /api/questions  -> create question { text, options: ["A","B"] }
router.post("/", (req, res) => {
  const { text, options } = req.body;
  if (!text || !Array.isArray(options)) {
    return res.status(400).json({ error: "Bad request: provide text and options array" });
  }

  const info = db.prepare("INSERT INTO questions (text) VALUES (?)").run(text);
  const questionId = info.lastInsertRowid;

  const insertOpt = db.prepare("INSERT INTO options (question_id, name, value) VALUES (?, ?, 0)");
  options.forEach(name => insertOpt.run(questionId, name));

  const created = db.prepare("SELECT * FROM questions WHERE id = ?").get(questionId);
  const createdOptions = db.prepare("SELECT id, name, value FROM options WHERE question_id = ?").all(questionId);
  res.status(201).json({ ...created, options: createdOptions });
});

export default router;
