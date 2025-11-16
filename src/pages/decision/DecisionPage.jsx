import { useState } from "react";
import "./DecisionPage.css";
import { askGemini } from "../../api/gemini";

const STEPS = {
  ASK_QUESTION: "ask_question",
  EDIT_CATEGORIES: "edit_categories",
  SET_WEIGHTS: "set_weights",
  RATE_OPTIONS: "rate_options",
  SHOW_RESULT: "show_result",
};

/* -------------------------------------------------------
    SMART OPTION EXTRACTION
-------------------------------------------------------*/
function extractOptions(text) {
  let t = text.toLowerCase().trim();
  t = t.replace(/[?.,]/g, "");

  // Pattern: "iphone or android", "iphone vs android"
  const pattern = /(.*?)([\w\s]+?)\s(?:or|vs|versus)\s([\w\s]+)$/i;
  const match = t.match(pattern);

  if (match) {
    return [
      match[2].trim().replace(/^(get|an|a)\s+/, ""),
      match[3].trim().replace(/^(get|an|a)\s+/, ""),
    ];
  }

  // Fallback: pick “biggest” two meaningful words at end
  const stop = new Set(["should","i","get","an","a","the","do","buy","choose","between"]);
  const words = t.split(/\s+/).filter(w => !stop.has(w));

  if (words.length >= 2) {
    return words.slice(-2).map(w => w.trim());
  }

  return ["Option 1", "Option 2"];
}

export default function DecisionPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text:
        "Hello! I'm here to help you make a thoughtful decision. What are you deciding between today? Please format your prompt as 'x or y' or 'x vs y'.",
    },
  ]);

  const [input, setInput] = useState("");
  const [step, setStep] = useState(STEPS.ASK_QUESTION);

  const [decision, setDecision] = useState("");
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const [weights, setWeights] = useState({});
  const [ratings, setRatings] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const [options, setOptions] = useState([]); // NOW dynamic!

  /* -------------------------------------------------------
        SEND BUTTON HANDLER
  -------------------------------------------------------*/
  const handleSend = async () => {
    if (!input.trim()) return;

    if (step === STEPS.ASK_QUESTION) {
      const userText = input.trim();

      // Add user message
      setMessages(prev => [
        ...prev,
        { id: prev.length + 1, type: "user", text: userText }
      ]);

      setDecision(userText);
      setInput("");
      setIsTyping(true);
      setStep(null);

      // Extract dynamic OPTIONS
      const extracted = extractOptions(userText);
      console.log("🔍 Extracted options:", extracted);
      setOptions(extracted);

      // Extract CATEGORIES via AI
      let aiCategories = [];
      let suggestedCategories = [];

      try {
        aiCategories = await askGemini(userText);
        console.log("🔥 AI returned categories:", aiCategories);

        if (Array.isArray(aiCategories) && aiCategories.length > 0) {
          suggestedCategories = Array.from(
            new Set(
              aiCategories.map(c => String(c).trim()).filter(c => c.length > 0)
            )
          );
        }
      } catch (err) {
        console.error("AI extraction error:", err);
      }

      if (suggestedCategories.length === 0) {
        console.warn("⚠ Using default categories (AI returned none)");
        suggestedCategories = ["Cost", "Time", "Culture", "Safety", "Weather"];
      }

      setTimeout(() => {
        setIsTyping(false);

        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            type: "bot",
            text:
              "Thanks for sharing that. Based on your decision, here are some categories you might consider. You can edit them freely. When you're ready, click 'Ready to continue.'",
          },
        ]);

        setCategories(suggestedCategories);
        setStep(STEPS.EDIT_CATEGORIES);
      }, 1200);
    }
  };

  /* -------------------------------------------------------
        CATEGORY EDITING STEP
  -------------------------------------------------------*/
  const renderCategoryEditor = () => (
    <div className="chat-section-bubble">
      <h3>Suggested Categories</h3>

      <div className="categories-grid">
        {categories.map((cat, idx) => (
          <div key={idx} className="category-card">
            <span>{cat}</span>
            <button
              className="category-remove"
              onClick={() =>
                setCategories(prev => prev.filter((_, i) => i !== idx))
              }
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="add-category-row">
        <input
          type="text"
          placeholder="Add your own category…"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          onClick={() => {
            if (!newCategory.trim()) return;
            setCategories(prev => [...prev, newCategory.trim()]);
            setNewCategory("");
          }}
        >
          Add
        </button>
      </div>

      <button
        className="primary-button"
        onClick={() => {
          setIsTyping(true);
          setStep(null);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: prev.length + 1,
                type: "bot",
                text:
                  "Great! Now tell me how important each category is to you on a scale of 1–5.",
              }
            ]);
            setStep(STEPS.SET_WEIGHTS);
          }, 800);
        }}
      >
        Ready to continue
      </button>
    </div>
  );

  /* -------------------------------------------------------
        CATEGORY WEIGHTS STEP
  -------------------------------------------------------*/
  const renderWeightsStep = () => (
    <div className="chat-section-bubble">
      <h3>How important is each category?</h3>
      <p className="helper-text">Slide from 1–5</p>

      <div className="weights-grid">
        {categories.map(cat => {
          const value = weights[cat] ?? 3;

          return (
            <div key={cat} className="weights-row">
              <span className="ratings-category-col">{cat}</span>

              <div className="slider-wrapper">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={value}
                  className="slider"
                  style={{ "--percent": `${((value - 1) * 100) / 4}%` }}
                  onChange={(e) =>
                    setWeights(prev => ({
                      ...prev,
                      [cat]: Number(e.target.value)
                    }))
                  }
                />
                <span className="slider-value">{value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="primary-button"
        onClick={() => {
          setIsTyping(true);
          setStep(null);

          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: prev.length + 1,
                type: "bot",
                text: "Great! Now rate each option in every category.",
              }
            ]);
            setStep(STEPS.RATE_OPTIONS);
          }, 800);
        }}
      >
        Ready to continue
      </button>
    </div>
  );

  /* -------------------------------------------------------
        RATE OPTIONS STEP (Dynamic options!)
  -------------------------------------------------------*/
  const renderRatingsStep = () => (
    <div className="chat-section-bubble">
      <h3>Rate Each Category</h3>
      <p className="helper-text">Rate each option 1–5</p>

      <div className="ratings-table">
        <div className="ratings-header">
          <span></span>
          {options.map(opt => (
            <span key={opt} className="ratings-option-col">
              {opt}
            </span>
          ))}
        </div>

        {categories.map(cat => (
          <div key={cat} className="ratings-row">
            <span className="ratings-category-col">{cat}</span>

            {options.map(opt => {
              const value = ratings[cat]?.[opt] ?? 3;

              return (
                <div className="slider-wrapper" key={opt}>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={value}
                    className="slider"
                    style={{ "--percent": `${((value - 1) * 100) / 4}%` }}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRatings(prev => ({
                        ...prev,
                        [cat]: { ...prev[cat], [opt]: val }
                      }));
                    }}
                  />
                  <span className="slider-value">{value}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <button
        className="primary-button"
        onClick={() => {
          setIsTyping(true);
          setStep(null);

          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: prev.length + 1,
                type: "bot",
                text: "Let me calculate your best option...",
              }
            ]);
            setStep(STEPS.SHOW_RESULT);
          }, 800);
        }}
      >
        Ready to continue
      </button>
    </div>
  );

  /* -------------------------------------------------------
        RESULTS
  -------------------------------------------------------*/
  const calculateResults = () => {
    const scores = {};

    options.forEach(opt => {
      let total = 0;

      categories.forEach(cat => {
        const weight = weights[cat] ?? 0;
        const rating = ratings[cat]?.[opt] ?? 0;
        total += weight * rating;
      });

      scores[opt] = total;
    });

    return scores;
  };

  const renderResults = () => {
    const scores = calculateResults();
    const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);

    const [bestOption, bestScore] = sorted[0];

    return (
      <div className="chat-section-bubble">
        <h3>Your Best Option</h3>

        <p>Based on your ratings and priorities, the better choice is:</p>

        <div className="best-result-box">
          <strong>{bestOption}</strong>
          <span className="score-tag">{bestScore.toFixed(1)}</span>
        </div>

        <p className="helper-text" style={{ marginTop:"1rem" }}>
          Score = (importance × rating) across all categories.
        </p>
      </div>
    );
  };

  /* -------------------------------------------------------
        MAIN JSX
  -------------------------------------------------------*/
  return (
    <div className="chatbot-page">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h1>Decision Assistant</h1>
          <p>Let's explore your decision together</p>
        </div>

        <div className="messages-container">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}

          {isTyping && (
            <div className="message bot typing">
              <div className="message-bubble">
                <span className="typing-dots">...</span>
              </div>
            </div>
          )}

          {step === STEPS.EDIT_CATEGORIES && renderCategoryEditor()}
          {step === STEPS.SET_WEIGHTS && renderWeightsStep()}
          {step === STEPS.RATE_OPTIONS && renderRatingsStep()}
          {step === STEPS.SHOW_RESULT && renderResults()}
        </div>

        {step === STEPS.ASK_QUESTION && (
          <div className="input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Tell me about your decision..."
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              onKeyDown={(e)=>e.key==="Enter" && handleSend()}
            />
            <button className="send-button" onClick={handleSend}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}





