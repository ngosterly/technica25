// functions/api/4-finalize-result.js
// Cloudflare Worker: Finalize result and save to database

import { buildFinalExplanationPrompt, callLLMWithRetry } from '../utils/api.js';
import { writeUserDecision } from '../utils/db.js';

/**
 * POST /api/4-finalize-result
 * Body: { uid, prompt, options: [...], categories: [...], weights: {...}, ratings: {...} }
 * Response: { saved: {...}, explanation: string }
 */
export async function onRequestPost(context) {
  try {
    const { uid, prompt, options, categories, weights, ratings } = await context.request.json();

    if (!uid || !prompt || !Array.isArray(options) ||
        !Array.isArray(categories) || !weights || !ratings) {
      return Response.json(
        { error: "Provide uid, prompt, options[], categories[], weights{}, ratings{}" },
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
    const explanationRaw = await callLLMWithRetry(explanationPrompt, apiKey);

    // Save to database
    const saved = await writeUserDecision(context.env, uid, {
      prompt,
      options,
      categories,
      weights: normWeights,
      scores: finalScores,
      result: explanationRaw,
    });

    console.log(`[${uid}] Decision saved:`, winner, finalScores);

    return Response.json({
      saved: {
        prompt,
        scores: finalScores,
        result: explanationRaw
      },
      explanation: explanationRaw
    });
  } catch (err) {
    console.error("Error in 4-finalize-result:", err);
    return Response.json(
      { error: String(err.message || err) },
      { status: 500 }
    );
  }
}
