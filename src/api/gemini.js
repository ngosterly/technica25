export async function askGemini(prompt) {
  try {
    const res = await fetch("https://decisionera-ai.laylaaphipps.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    console.log("⚡ Worker raw response:", data);

    let text = data?.choices?.[0]?.message?.content;
    if (!text) return [];

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
      return JSON.parse(text);
    } catch (err) {
      console.error("JSON parse fail:", err, "Text was:", text);
      return [];
    }

  } catch (err) {
    console.error("Error inside askGemini:", err);
    return [];
  }
}








