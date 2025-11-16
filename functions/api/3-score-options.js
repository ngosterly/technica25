// functions/api/3-score-options.js
// Cloudflare Worker: Get AI ratings for options

import { buildScoreOptionsPrompt, callLLMWithRetry, parseRatingsLines } from '../utils/api.js';

/**
 * POST /api/3-score-options
 * Body: { uid, prompt, options: [...], categories: [...] }
 * Response: { aiRatings: { "option": { "category": number } }, raw: string }
 */
export async function onRequestPost(context) {
  try {
    const { uid, prompt, options, categories } = await context.request.json();

    if (!uid || !prompt || !Array.isArray(options) || !Array.isArray(categories)) {
      return Response.json(
        { error: "Provide uid, prompt, options[], categories[]" },
        { status: 400 }
      );
    }

    const apiKey = context.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENROUTER_API_KEY not configured" },
        { status: 500 }
      );
    }

    const promptText = buildScoreOptionsPrompt(prompt, options, categories);
    const raw = await callLLMWithRetry(promptText, apiKey);

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

    return Response.json({ aiRatings, raw });
  } catch (err) {
    console.error("Error in 3-score-options:", err);
    return Response.json(
      { error: String(err.message || err) },
      { status: 500 }
    );
  }
}
