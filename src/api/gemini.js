export async function askGemini(prompt) {
  try {
    // Enhanced prompt to extract both options and categories
    const enhancedPrompt = `Based on this decision question: "${prompt}"

Please identify:
1. The TWO options being compared (extract them from the question)
2. Relevant decision-making categories to evaluate these options

Return ONLY a JSON object in this exact format:
{
  "options": ["Option 1", "Option 2"],
  "categories": ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"]
}

Example:
Question: "Should I study abroad in Scotland or Korea?"
Response: {"options": ["Scotland", "Korea"], "categories": ["Cost", "Culture", "Language Barrier", "Career Opportunities", "Weather"]}

Return ONLY the JSON object, no other text.`;

    const res = await fetch("https://decisionera-ai.laylaaphipps.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: enhancedPrompt }),
    });

    const data = await res.json();
    console.log("⚡ Worker raw response:", data);

    let text = data?.choices?.[0]?.message?.content;
    if (!text) return { options: [], categories: [] };

    text = text.trim();

    // -------------------------------------
    // SUPER CLEANING: remove ALL Markdown crap
    // -------------------------------------
    text = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .replace(/^json/i, "")
      .trim();

    console.log("🧹 Cleaned text:", text);

    // Try parsing now
    try {
      const parsed = JSON.parse(text);
      // Ensure we return the expected format
      return {
        options: Array.isArray(parsed.options) ? parsed.options.slice(0, 2) : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories : []
      };
    } catch (err) {
      console.error("JSON parse fail:", err, "Text was:", text);
      return { options: [], categories: [] };
    }

  } catch (err) {
    console.error("Error inside askGemini:", err);
    return { options: [], categories: [] };
  }
}








