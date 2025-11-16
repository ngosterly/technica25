// index.js
// Express server with 4 endpoints for decision helper

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { 
  buildExtractOptionsPrompt, 
  buildExtractCategoriesPrompt, 
  buildScoreOptionsPrompt, 
  buildFinalExplanationPrompt, 
  askOpenRouter, 
  parsePipeSeparatedLine, 
  parseRatingsLines 
} from "./api.js";
import { writeUserDecision } from "./db.js";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "200kb" }));

const PORT = process.env.PORT || 3000;

/* ----------------------
   Helper: LLM call with retries
   ---------------------- */
async function callLLMWithRetry(prompt, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const out = await askOpenRouter(prompt);
      return out;
    } catch (err) {
      lastErr = err;
      console.warn(`LLM call error, retry ${i}:`, err.message || err);
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}

/* ----------------------
   1) Extract options from user prompt
   Body: { uid, prompt }
   Response: { options: [...], raw: string }
   ---------------------- */
app.post("/api/1-extract-options", async (req, res) => {
  try {
    const { uid, prompt } = req.body;
    if (!uid || !prompt) {
      return res.status(400).json({ error: "Provide uid and prompt" });
    }

    const promptText = buildExtractOptionsPrompt(prompt);
    const raw = await callLLMWithRetry(promptText);
    const options = parsePipeSeparatedLine(raw);

    if (options.length === 0) {
      return res.status(400).json({ 
        error: "Could not extract options. Please rephrase your decision." 
      });
    }

    console.log(`[${uid}] Extracted options:`, options);
    return res.json({ options, raw });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err.message || err) });
  }
});

/* ----------------------
   2) Extract categories based on options
   Body: { uid, prompt, options: [...] }
   Response: { categories: [...], raw: string }
   ---------------------- */
app.post("/api/2-extract-categories", async (req, res) => {
  try {
    const { uid, prompt, options } = req.body;
    if (!uid || !prompt || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: "Provide uid, prompt, and options[]" });
    }

    const promptText = buildExtractCategoriesPrompt(prompt, options);
    const raw = await callLLMWithRetry(promptText);
    const categories = parsePipeSeparatedLine(raw);

    if (categories.length === 0) {
      // Provide fallback categories
      const fallback = ["Cost", "Time", "Quality", "Convenience"];
      console.log(`[${uid}] No categories extracted, using fallback`);
      return res.json({ categories: fallback, raw });
    }

    console.log(`[${uid}] Extracted categories:`, categories);
    return res.json({ categories, raw });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err.message || err) });
  }
});

/* ----------------------
   3) Get AI ratings for options
   Body: { uid, prompt, options: [...], categories: [...] }
   Response: { aiRatings: { "option": { "category": number } }, raw: string }
   ---------------------- */
app.post("/api/3-score-options", async (req, res) => {
  try {
    const { uid, prompt, options, categories } = req.body;
    if (!uid || !prompt || !Array.isArray(options) || !Array.isArray(categories)) {
      return res.status(400).json({ 
        error: "Provide uid, prompt, options[], categories[]" 
      });
    }

    const promptText = buildScoreOptionsPrompt(prompt, options, categories);
    const raw = await callLLMWithRetry(promptText);

    // Parse ratings: { "option": [num, num, ...] }
    const parsed = parseRatingsLines(raw);

    // Map to category names: { "option": { "category": num } }
    const aiRatings = {};
    
    for (const [optionText, nums] of Object.entries(parsed)) {
      // Find matching option (case-insensitive, partial match)
      const optMatch = options.find(o => 
        o.toLowerCase() === optionText.toLowerCase()
      ) || options.find(o => 
        optionText.toLowerCase().includes(o.toLowerCase())
      ) || options.find(o => 
        o.toLowerCase().includes(optionText.toLowerCase())
      ) || options[0]; // fallback

      const categoryMap = {};
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        // Scale from 1-10 to 1-5 for consistency with frontend
        const val = Math.round((Number(nums[i]) || 5) / 2);
        categoryMap[cat] = Math.max(1, Math.min(5, val));
      }
      aiRatings[optMatch] = categoryMap;
    }

    // Ensure all options have ratings
    options.forEach(opt => {
      if (!aiRatings[opt]) {
        const defaultRatings = {};
        categories.forEach(cat => {
          defaultRatings[cat] = 3; // neutral default
        });
        aiRatings[opt] = defaultRatings;
      }
    });

    console.log(`[${uid}] AI Ratings:`, aiRatings);
    return res.json({ aiRatings, raw });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err.message || err) });
  }
});

/* ----------------------
   4) Finalize result and save to database
   Body: { uid, prompt, options: [...], categories: [...], weights: {...}, ratings: {...} }
   Response: { saved: {...}, explanation: string }
   ---------------------- */
app.post("/api/4-finalize-result", async (req, res) => {
  try {
    const { uid, prompt, options, categories, weights, ratings } = req.body;
    
    if (!uid || !prompt || !Array.isArray(options) || 
        !Array.isArray(categories) || !weights || !ratings) {
      return res.status(400).json({ 
        error: "Provide uid, prompt, options[], categories[], weights{}, ratings{}" 
      });
    }

    // Normalize weights to sum to 1
    const rawWeights = Object.fromEntries(
      Object.entries(weights).map(([k, v]) => [k, Number(v) || 0])
    );
    const totalWeight = Object.values(rawWeights).reduce((s, x) => s + x, 0) || 1;
    const normWeights = {};
    for (const cat of categories) {
      normWeights[cat] = (rawWeights[cat] || 0) / totalWeight;
    }

    // Calculate final scores: weighted sum
    const finalScores = {};
    for (const opt of options) {
      const perCat = ratings[opt] || {};
      let total = 0;
      
      for (const cat of categories) {
        const ratingVal = Number(perCat[cat]) || 0;
        total += normWeights[cat] * ratingVal;
      }
      
      // Scale to 0-100 (ratings are 1-5, so max is 5)
      finalScores[opt] = Number(((total / 5) * 100).toFixed(2));
    }

    // Find winner
    const winner = Object.entries(finalScores)
      .sort((a, b) => b[1] - a[1])[0][0];

    // Get AI explanation
    const explanationPrompt = buildFinalExplanationPrompt(
      prompt, 
      options, 
      categories, 
      finalScores
    );
    const explanationRaw = await callLLMWithRetry(explanationPrompt);

    // Save to database
    const saved = await writeUserDecision(uid, {
      prompt,
      options,
      categories,
      weights: normWeights,
      scores: finalScores,
      result: explanationRaw,
    });

    console.log(`[${uid}] Decision saved:`, winner, finalScores);

    return res.json({ 
      saved: {
        prompt,
        scores: finalScores,
        result: explanationRaw
      }, 
      explanation: explanationRaw 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err.message || err) });
  }
});

/* ----------------------
   Health check endpoint
   ---------------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ----------------------
   Start server
   ---------------------- */
app.listen(PORT, () => {
  console.log(`✓ Decision Helper API listening on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
});

export default app;