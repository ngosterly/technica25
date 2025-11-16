export async function askGemini(prompt, userId = null) {
  try {
    console.log("🤖 Sending prompt to AI:", prompt);
    console.log("👤 User ID:", userId);

    // Enhanced prompt to extract both options and categories
    const enhancedPrompt = `Analyze this decision question and extract the two options being compared and suggest relevant categories.

Question: "${prompt}"

Respond with ONLY a valid JSON object (no markdown, no code blocks) in exactly this format:
{"options": ["Option A", "Option B"], "categories": ["Category1", "Category2", "Category3", "Category4", "Category5"]}

Example:
Question: "Should I buy a house or rent an apartment?"
Response: {"options": ["Buy a house", "Rent an apartment"], "categories": ["Cost", "Flexibility", "Long-term Investment", "Maintenance", "Location"]}`;

    const requestBody = {
      prompt: enhancedPrompt
    };

    // Include userId if provided
    if (userId) {
      requestBody.userId = userId;
    }

    console.log("📤 Request body:", requestBody);

    // TODO: Replace this URL with your Cloudflare Worker URL after deployment
    const WORKER_URL = "https://hail.trbrozek.workers.dev/";

    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      console.error("❌ Worker returned error status:", res.status);
      return { options: [], categories: [] };
    }

    const data = await res.json();
    console.log("⚡ Worker raw response:", data);

    // Check for error response
    if (data.error) {
      console.error("❌ Worker returned error:", data.error);
      if (data.error.code === 401) {
        console.error("❌ Authentication error - Worker requires valid user authentication");
      }
      return { options: [], categories: [] };
    }

    let text = data?.choices?.[0]?.message?.content;
    if (!text) {
      console.error("❌ No content in AI response");
      console.error("❌ Full response structure:", JSON.stringify(data, null, 2));
      return { options: [], categories: [] };
    }

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








