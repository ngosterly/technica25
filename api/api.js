// api.js
import "dotenv/config";
import fetch from "node-fetch";

const API_KEY = process.env.API_KEY;

/**
 * Call OpenRouter with a given prompt.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function askOpenRouter(prompt) {
  const url = "https://openrouter.ai/api/v1/chat/completions";

  const body = {
    model: "google/gemini-2.5-flash",
    messages: [{ role: "user", content: prompt }],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * Prompt wrapper that prepares Gemini instructions.
 * 
 * @param {string} text The user-provided prompt
 * @param {"category" | "rating"} type
 */
export function wrapPrompt(text, type) {
  let wrapper = "";

  switch (type) {
    case "category":
      wrapper = `You must ONLY output a comma-separated list of relevant categories. Example format: "cost, time, fun". No explanation. `;
      break;

    case "rating":
      wrapper = `You must ONLY output category ratings in a comma-separated numeric list. Example format: "1, 8, 10, 6". No explanation. `;
      break;

    default:
      throw new Error(`Invalid prompt wrapper type: ${type}`);
  }

  return wrapper + "\nUser prompt: " + text;
}

// Example debug run
if (process.argv[2] === "test") {
  const prompt = wrapPrompt("Which is better: biking to work or driving?", "category");
  askOpenRouter(prompt).then(console.log);
}
