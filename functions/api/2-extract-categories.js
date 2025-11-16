// functions/api/2-extract-categories.js
// Cloudflare Worker: Extract categories based on options

import { buildExtractCategoriesPrompt, callLLMWithRetry, parsePipeSeparatedLine } from '../utils/api.js';

/**
 * POST /api/2-extract-categories
 * Body: { uid, prompt, options: [...] }
 * Response: { categories: [...], raw: string }
 */
export async function onRequestPost(context) {
  try {
    const { uid, prompt, options } = await context.request.json();

    if (!uid || !prompt || !options || !Array.isArray(options)) {
      return Response.json(
        { error: "Provide uid, prompt, and options[]" },
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

    const promptText = buildExtractCategoriesPrompt(prompt, options);
    const raw = await callLLMWithRetry(promptText, apiKey);
    const categories = parsePipeSeparatedLine(raw);

    if (categories.length === 0) {
      // Provide fallback categories
      const fallback = ["Cost", "Time", "Quality", "Convenience"];
      console.log(`[${uid}] No categories extracted, using fallback`);
      return Response.json({ categories: fallback, raw });
    }

    console.log(`[${uid}] Extracted categories:`, categories);

    return Response.json({ categories, raw });
  } catch (err) {
    console.error("Error in 2-extract-categories:", err);
    return Response.json(
      { error: String(err.message || err) },
      { status: 500 }
    );
  }
}
