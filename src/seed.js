// src/seed.js
import db from "./models/db.js";

const count = db.prepare("SELECT COUNT(*) as c FROM questions").get().c;
if (count > 0) {
  console.log("DB already has questions — skipping seed.");
  process.exit(0);
}

const insertQuestion = db.prepare("INSERT INTO questions (text) VALUES (?)");
const insertOption = db.prepare("INSERT INTO options (question_id, name, value) VALUES (?, ?, 0)");

const qInfo = insertQuestion.run("Who will be the next mayor of New York City?");
const qId = qInfo.lastInsertRowid;
["Candidate A", "Candidate B", "Candidate C"].forEach(name => insertOption.run(qId, name));

console.log("Seed complete. You can run `npm run dev` and try GET /api/questions");
