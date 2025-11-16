// functions/api/1-extract-options.js
// Cloudflare Worker: Extract options from user prompt

import { buildExtractOptionsPrompt, callLLMWithRetry, parsePipeSeparatedLine } from '../utils/api.js';

/**
 * POST /api/1-extract-options
 * Body: { uid, prompt }
 * Response: { options: [...], raw: string }
 */
export async function onRequestPost(context) {
  try {
    const { uid, prompt } = await context.request.json();

    if (!uid || !prompt) {
      return Response.json(
        { error: "Provide uid and prompt" },
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

    const promptText = buildExtractOptionsPrompt(prompt);
    const raw = await callLLMWithRetry(promptText, apiKey);
    const options = parsePipeSeparatedLine(raw);

    if (options.length === 0) {
      return Response.json(
        { error: "Could not extract options. Please rephrase your decision." },
        { status: 400 }
      );
    }

    console.log(`[${uid}] Extracted options:`, options);

    return Response.json({ options, raw });
  } catch (err) {
    console.error("Error in 1-extract-options:", err);
    return Response.json(
      { error: String(err.message || err) },
      { status: 500 }
    );
  }
}
