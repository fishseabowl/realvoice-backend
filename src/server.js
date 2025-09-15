// src/server.js
import express from "express";
import cors from "cors";
import questionsRouter from "./routes/questions.js";
import betsRouter from "./routes/bets.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Realvoice backend is running"));

// mount routes
app.use("/api/questions", questionsRouter);
app.use("/api/bets", betsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Realvoice backend running at http://localhost:${PORT}`);
});
