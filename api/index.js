// index.js
// Simple Express server exposing the 4 endpoints.
// Connects api.js and db.js

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import { buildExtractOptionsPrompt, buildExtractCategoriesPrompt, buildScoreOptionsPrompt, buildFinalExplanationPrompt, askOpenRouter, parsePipeSeparatedLine, parseRatingsLines } from "./api.js";
import { writeUserDecision } from "./db.js";

const app = express();
app.use(bodyParser.json({ limit: "200kb" }));

const PORT = process.env.PORT || 3000;

/* ----------------------
   Helper: safe call to LLM with retries
   ---------------------- */
async function callLLMWithRetry(prompt, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const out = await askOpenRouter(prompt);
      return out;
    } catch (err) {
      lastErr = err;
      console.warn("LLM call error, retry", i, err.message || err);
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}

/* ----------------------
   1) Extract options
   Body: { uid, prompt }
   Response: { options: [ ... ] }
   ---------------------- */
app.post("/api/1-extract-options", async (req, res) => {
  try {
    const { uid, prompt } = req.body;
    if (!uid || !prompt) return res.status(400).json({ error: "Provide uid and prompt" });

    const p = buildExtractOptionsPrompt(prompt);
    const raw = await callLLMWithRetry(p);
    const options = parsePipeSeparatedLine(raw);

    return res.json({ options, raw });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

/* ----------------------
   2) Extract categories
   Body: { uid, prompt, options: [ ... ] }
   Response: { categories: [ ... ] }
   ---------------------- */
app.post("/api/2-extract-categories", async (req, res) => {
  try {
    const { uid, prompt, options } = req.body;
    if (!uid || !prompt || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: "Provide uid, prompt, options[]" });
    }

    const p = buildExtractCategoriesPrompt(prompt, options);
    const raw = await callLLMWithRetry(p);
    const categories = parsePipeSeparatedLine(raw);

    return res.json({ categories, raw });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

/* ----------------------
   3) Score options
   Body: { uid, prompt, options: [...], categories: [...] }
   Response: { aiRatings: { "<option>": { "<category>": number } }, raw }
   ---------------------- */
app.post("/api/3-score-options", async (req, res) => {
  try {
    const { uid, prompt, options, categories } = req.body;
    if (!uid || !prompt || !Array.isArray(options) || !Array.isArray(categories)) {
      return res.status(400).json({ error: "Provide uid, prompt, options[], categories[]" });
    }

    const p = buildScoreOptionsPrompt(prompt, options, categories);
    const raw = await callLLMWithRetry(p);

    // parse into arrays of numbers
    const parsed = parseRatingsLines(raw);

    // map numbers to category names
    const aiRatings = {};
    for (const [optionText, nums] of Object.entries(parsed)) {
      // find the option in provided options that matches (fuzzy match)
      // We'll try exact match first otherwise fallback to best match by startsWith
      const optMatch = options.find((o) => o.toLowerCase() === optionText.toLowerCase()) ||
                       options.find((o) => optionText.toLowerCase().startsWith(o.toLowerCase())) ||
                       options.find((o) => o.toLowerCase().startsWith(optionText.toLowerCase())) ||
                       options[0]; // fallback

      const map = {};
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const val = Number(nums[i]) || 0;
        map[cat] = val;
      }
      aiRatings[optMatch] = map;
    }

    return res.json({ aiRatings, raw });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

/* ----------------------
   4) Finalize result
   Body: {
     uid,
     prompt,
     options: [...],
     categories: [...],
     weights: { "<category>": number },  // e.g. 1-5
     ratings: { "<option>": { "<category>": number } }  // could be AI ratings or user-adjusted
   }
   Response: { saved: { prompt, scores, result }, explanation }
   ---------------------- */
app.post("/api/4-finalize-result", async (req, res) => {
  try {
    const { uid, prompt, options, categories, weights, ratings } = req.body;
    if (!uid || !prompt || !Array.isArray(options) || !Array.isArray(categories) || !weights || !ratings) {
      return res.status(400).json({ error: "Provide uid, prompt, options[], categories[], weights{}, ratings{}" });
    }

    // Normalize weights to sum to 1
    const rawWeights = Object.fromEntries(Object.entries(weights || {}).map(([k, v]) => [k, Number(v) || 0]));
    const totalWeight = Object.values(rawWeights).reduce((s, x) => s + x, 0) || 1;
    const normWeights = {};
    for (const c of categories) {
      normWeights[c] = (rawWeights[c] || 0) / totalWeight;
    }

    // Compute final numeric score per option: weighted sum of category ratings
    const finalScores = {};
    for (const opt of options) {
      const perCat = ratings[opt] || ratings[Object.keys(ratings).find(k => k.toLowerCase().includes(opt.toLowerCase()))] || {};
      let total = 0;
      for (const cat of categories) {
        const ratingVal = Number(perCat[cat]) || 0;
        total += normWeights[cat] * ratingVal;
      }
      // normalize to 0-100 for readability (ratings are 1-10 or 1-5 depending on your pipeline)
      // We will assume ratings are 1-10 (AI used 1-10). If frontend uses 1-5, that's fine but scores will be lower.
      finalScores[opt] = Number((total * 10).toFixed(2)); // convert 0-1-ish *10 -> 0-100-ish
    }

    // find winner
    const winner = Object.entries(finalScores).sort((a,b) => b[1] - a[1])[0];

    // Ask Gemini to explain why the winner is better given finalScores
    const explanationPrompt = buildFinalExplanationPrompt(prompt, options, categories, finalScores);
    const explanationRaw = await callLLMWithRetry(explanationPrompt);

    // Save to DB at users/{uid}
    const saved = await writeUserDecision(uid, {
      prompt,
      scores: finalScores,
      result: explanationRaw,
    });

    return res.json({ saved, explanation: explanationRaw });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

/* ----------------------
   Start server
   ---------------------- */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
