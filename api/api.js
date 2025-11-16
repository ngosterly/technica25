// api.js
// OpenRouter/Gemini wrapper and prompt templates + parsers

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_NAME = "google/gemini-2.5-flash";
const SEPARATOR = "|"; // chosen separator

if (!OPENROUTER_KEY) {
  throw new Error("Set OPENROUTER_API_KEY env var.");
}

/** low-level call */
export async function askOpenRouter(prompt, opts = {}) {
  const body = {
    model: MODEL_NAME,
    messages: [{ role: "user", content: prompt }],
    ...opts,
  };

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${txt}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  return content;
}

/* ---------------------------
   Prompt templates
   --------------------------- */

/**
 * Ask Gemini to extract options from the user's prompt and return only a single-line
 * string using the chosen separator, e.g. "a | b | c".
 */
export function buildExtractOptionsPrompt(userPrompt) {
  return [
    `Extract the options the user is deciding between from this prompt.`,
    `Return ONE LINE only containing the options separated by the pipe character ' ${SEPARATOR} ' and nothing else.`,
    `If you can only find two main options, return exactly "optionA ${SEPARATOR} optionB".`,
    `User prompt:`,
    `---`,
    userPrompt,
    `---`,
    `Output example: "biking to work ${SEPARATOR} driving to work"`,
  ].join("\n");
}

/**
 * Ask Gemini to generate candidate categories.
 * Return one-line with categories separated by the pipe.
 */
export function buildExtractCategoriesPrompt(userPrompt, optionsArray) {
  return [
    `Given this user's decision prompt and the two options, suggest 3-7 relevant comparison categories.`,
    `Return ONE LINE only containing categories separated by the pipe ' ${SEPARATOR} ' and nothing else.`,
    `Do NOT add explanation text.`,
    `User prompt:`,
    `---`,
    userPrompt,
    `---`,
    `Options:`,
    optionsArray.map((o) => `- ${o}`).join("\n"),
    `Output example: "cost ${SEPARATOR} time ${SEPARATOR} safety"`,
  ].join("\n");
}

/**
 * Ask Gemini to score each option per category.
 * Return multi-line text with lines like:
 * "biking to work: 9,7,10"
 * The categories should be in the same order as provided.
 */
export function buildScoreOptionsPrompt(userPrompt, optionsArray, categoriesArray) {
  const cats = categoriesArray.join(", ");
  return [
    `For this decision, score each option for each category on a 1-10 scale (integers).`,
    `Return ONLY lines in the format:`,
    `OPTION_TEXT: score1,score2,score3`,
    `Where score1 corresponds to the first category, score2 to the second, etc.`,
    `Do NOT provide extra commentary.`,
    `Categories (in order): ${cats}`,
    `User prompt:`,
    `---`,
    userPrompt,
    `---`,
    `Options:`,
    optionsArray.map((o) => `- ${o}`).join("\n"),
    `Example output:`,
    `biking to work: 9,7,10`,
    `driving to work: 3,8,4`,
  ].join("\n");
}

/**
 * Ask Gemini for a final explanation given the computed numeric scores.
 * The backend will pass the computed numeric scores and ask Gemini to explain why the winner is better.
 */
export function buildFinalExplanationPrompt(promptText, optionsArray, categoriesArray, computedScores) {
  // computedScores is object: { "<option>": number, ... }
  const scoreLines = Object.entries(computedScores)
    .map(([opt, sc]) => `${opt}: ${Number(sc).toFixed(2)}`)
    .join("\n");

  return [
    `You are given the user's original prompt and the numeric final scores for each option.`,
    `Provide a concise, human-facing explanation (2-4 short paragraphs) of WHY the top-scoring option is the better choice, referencing the categories when helpful.`,
    `Be factual and constructive. Do NOT invent facts about real-world specifics; focus on the categories and scores.`,
    `Original prompt:`,
    `---`,
    promptText,
    `---`,
    `Categories: ${categoriesArray.join(", ")}`,
    `Final scores:`,
    scoreLines,
    `Output: Plain explanatory text only.`,
  ].join("\n");
}

/* ---------------------------
   Parsers
   --------------------------- */

/** parse single-line pipe-separated -> array of trimmed strings */
export function parsePipeSeparatedLine(line) {
  if (!line || typeof line !== "string") return [];
  return line
    .split(SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parse multi-line rating output like:
 * biking to work: 9,7,10
 * driving to work: 3,8,4
 * Returns: { "<option>": [num, num, ...], ... }
 */
export function parseRatingsLines(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = {};

  for (const line of lines) {
    // split at first colon
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const option = line.slice(0, idx).trim();
    const rest = line.slice(idx + 1).trim();
    const nums = rest.split(",").map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n));
    if (option && nums.length) {
      out[option] = nums;
    }
  }
  return out;
}
