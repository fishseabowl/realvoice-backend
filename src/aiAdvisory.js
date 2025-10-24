// backend/aiAdvisory.js
import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Advisory endpoint
router.get("/", async (req, res) => {
  const { question } = req.query;

  try {
    // Example: fetch Bitcoin price (you can extend with other assets later)
    const priceRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    const priceData = await priceRes.json();
    const btcPrice = priceData.bitcoin.usd;

    // AI prompt
    const prompt = `
    Question: ${question}
    Current BTC price: $${btcPrice}

    Based on this information and general market knowledge, estimate the probability of YES vs NO.
    Respond in JSON format only:
    { "yesProbability": number, "noProbability": number, "reasoning": string }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    // Parse AI response
    let result;
    try {
      result = JSON.parse(response.choices[0].message.content);
    } catch (e) {
      result = { yesProbability: 0.5, noProbability: 0.5, reasoning: "Unable to parse AI output." };
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI advisory failed" });
  }
});

export default router;
