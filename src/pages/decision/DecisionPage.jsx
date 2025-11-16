import { useState } from "react";
import "./DecisionPage.css";

const STEPS = {
  ASK_QUESTION: "ask_question",
  EDIT_CATEGORIES: "edit_categories",
  SET_WEIGHTS: "set_weights",
  RATE_OPTIONS: "rate_options",
  SHOW_RESULT: "show_result",
};

export default function DecisionPage({ userId }) {
  // Use provided userId instead of generating UUID
  const uid = userId || crypto.randomUUID(); // Fallback for testing
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm here to help you make a thoughtful decision. What are you deciding between today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [step, setStep] = useState(STEPS.ASK_QUESTION);

  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [weights, setWeights] = useState({});
  const [ratings, setRatings] = useState({});
  const [finalResult, setFinalResult] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  /* -------------------------------------------------------
      API CALL HELPER (silently fails)
  -------------------------------------------------------*/
  async function callAPI(endpoint, body) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "API request failed");
      }
      
      return data;
    } catch (err) {
      console.error("API Error:", err);
      // Silently fail - return null
      return null;
    }
  }

  /* -------------------------------------------------------
     STEP 1: EXTRACT OPTIONS FROM USER PROMPT
  -------------------------------------------------------*/
  const handleSend = async () => {
    if (!input.trim()) return;

    if (step === STEPS.ASK_QUESTION) {
      const userMessage = {
        id: messages.length + 1,
        type: "user",
        text: input,
      };

      setMessages((prev) => [...prev, userMessage]);
      setPrompt(input);
      setInput("");
      setIsTyping(true);
      setStep(null);

      // Call API to extract options
      const data = await callAPI("/api/1-extract-options", {
        uid: uid,
        prompt: input,
      });

      if (!data || !data.options || data.options.length === 0) {
        // Silently fail - show generic message
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            type: "bot",
            text: "I'm having trouble understanding. Could you rephrase your decision?",
          },
        ]);
        setStep(STEPS.ASK_QUESTION);
        return;
      }

      console.log("Extracted options:", data);
      setOptions(data.options);

      // Now extract categories
      const categoriesData = await callAPI("/api/2-extract-categories", {
        uid: uid,
        prompt: input,
        options: data.options,
      });

      console.log("Extracted categories:", categoriesData);
      
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: "bot",
          text: `I see you're deciding between ${data.options.join(" and ")}. Here are some categories you might consider. You can edit them freely. When you're ready, click 'Ready to continue.'`,
        },
      ]);

      setCategories(categoriesData?.categories || ["Cost", "Time", "Quality"]);
      
      // Initialize default weights
      const defaultWeights = {};
      (categoriesData?.categories || []).forEach(cat => {
        defaultWeights[cat] = 3;
      });
      setWeights(defaultWeights);

      setStep(STEPS.EDIT_CATEGORIES);
    }
  };

  /* -------------------------------------------------------
     STEP 2: EDIT CATEGORIES
  -------------------------------------------------------*/
  const handleCategoriesReady = async () => {
    setIsTyping(true);
    setStep(null);

    // Get AI ratings for the options based on categories
    const ratingsData = await callAPI("/api/3-score-options", {
      uid: uid,
      prompt: prompt,
      options: options,
      categories: categories,
    });

    console.log("AI Ratings:", ratingsData);

    // Convert aiRatings format to our ratings state format
    const convertedRatings = {};
    categories.forEach(cat => {
      convertedRatings[cat] = {};
      options.forEach(opt => {
        const optionRatings = ratingsData?.aiRatings?.[opt] || {};
        convertedRatings[cat][opt] = optionRatings[cat] || 3;
      });
    });

    setRatings(convertedRatings);

    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: "bot",
        text: "Great! Now tell me how important each category is to you on a scale from 1 to 5.",
      },
    ]);
    setStep(STEPS.SET_WEIGHTS);
  };

  const renderCategoryEditor = () => (
    <div className="chat-section-bubble">
      <h3>Suggested Categories</h3>

      <div className="categories-grid">
        {categories.map((cat, idx) => (
          <div key={idx} className="category-card">
            <span>{cat}</span>
            <button
              className="category-remove"
              onClick={() => {
                const catToRemove = cat;
                setCategories((prev) => prev.filter((_, i) => i !== idx));
                // Remove weight for removed category
                setWeights((prev) => {
                  const newWeights = { ...prev };
                  delete newWeights[catToRemove];
                  return newWeights;
                });
              }}
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && newCategory.trim()) {
              const catToAdd = newCategory.trim();
              setCategories((prev) => [...prev, catToAdd]);
              // Initialize weight for new category
              setWeights((prev) => ({ ...prev, [catToAdd]: 3 }));
              setNewCategory("");
            }
          }}
        />
        <button
          onClick={() => {
            if (!newCategory.trim()) return;
            const catToAdd = newCategory.trim();
            setCategories((prev) => [...prev, catToAdd]);
            // Initialize weight for new category
            setWeights((prev) => ({ ...prev, [catToAdd]: 3 }));
            setNewCategory("");
          }}
        >
          Add
        </button>
      </div>

      <button
        className="primary-button"
        onClick={handleCategoriesReady}
        disabled={categories.length === 0}
      >
        Ready to continue
      </button>
    </div>
  );

  /* -------------------------------------------------------
     STEP 3: SET WEIGHTS
  -------------------------------------------------------*/
  const renderWeightsStep = () => (
    <div className="chat-section-bubble">
      <h3>How important is each category?</h3>
      <p className="helper-text">Rate importance from 1–5</p>

      <div className="weights-grid">
        {categories.map((cat) => {
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
                  style={{
                    "--percent": `${((value - 1) * 100) / 4}%`,
                  }}
                  onChange={(e) =>
                    setWeights((prev) => ({
                      ...prev,
                      [cat]: Number(e.target.value),
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
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                type: "bot",
                text: "Perfect. I've already analyzed your options. You can adjust the ratings if you'd like.",
              },
            ]);
            setStep(STEPS.RATE_OPTIONS);
          }, 1500);
        }}
      >
        Ready to continue
      </button>
    </div>
  );

  /* -------------------------------------------------------
     STEP 4: RATE OPTIONS (with AI pre-filled ratings)
  -------------------------------------------------------*/
  const renderRatingsStep = () => (
    <div className="chat-section-bubble">
      <h3>Review & Adjust Ratings</h3>
      <p className="helper-text">
        I've rated each option for you. Feel free to adjust from 1–5.
      </p>

      <div className="ratings-table">
        <div className="ratings-header">
          <span></span>
          {options.map((opt) => (
            <span key={opt} className="ratings-option-col">
              {opt}
            </span>
          ))}
        </div>

        {categories.map((cat) => (
          <div key={cat} className="ratings-row">
            <span className="ratings-category-col">{cat}</span>

            {options.map((opt) => {
              const value = ratings[cat]?.[opt] ?? 3;

              return (
                <div className="slider-wrapper" key={opt}>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={value}
                    className="slider"
                    style={{
                      "--percent": `${((value - 1) * 100) / 4}%`,
                    }}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRatings((prev) => ({
                        ...prev,
                        [cat]: { ...prev[cat], [opt]: val },
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
        onClick={handleFinalize}
      >
        Calculate Final Result
      </button>
    </div>
  );

  /* -------------------------------------------------------
     STEP 5: FINALIZE & GET AI EXPLANATION
  -------------------------------------------------------*/
  const handleFinalize = async () => {
    setIsTyping(true);
    setStep(null);

    // Convert ratings back to the format the backend expects
    const convertedRatings = {};
    options.forEach(opt => {
      convertedRatings[opt] = {};
      categories.forEach(cat => {
        convertedRatings[opt][cat] = ratings[cat]?.[opt] || 3;
      });
    });

    const result = await callAPI("/api/4-finalize-result", {
      uid: uid,
      prompt: prompt,
      options: options,
      categories: categories,
      weights: weights,
      ratings: convertedRatings,
    });

    console.log("Final result:", result);

    if (!result) {
      // Silently calculate locally if API fails
      const localScores = calculateLocalScores();
      setFinalResult({
        saved: {
          scores: localScores,
          result: "Based on your ratings and priorities, here's how the options compare."
        },
        explanation: "Based on your ratings and priorities, here's how the options compare."
      });
    } else {
      setFinalResult(result);
    }

    setIsTyping(false);
    
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: "bot",
        text: "I've calculated the results based on your priorities!",
      },
    ]);
    
    setStep(STEPS.SHOW_RESULT);
  };

  /* -------------------------------------------------------
     LOCAL SCORE CALCULATION (fallback)
  -------------------------------------------------------*/
  const calculateLocalScores = () => {
    const optionScores = {};
    
    // Normalize weights
    const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0) || 1;
    
    options.forEach((opt) => {
      let total = 0;
      categories.forEach((cat) => {
        const weight = (weights[cat] || 0) / totalWeight;
        const rating = ratings[cat]?.[opt] || 0;
        total += weight * rating;
      });
      // Scale to 0-100
      optionScores[opt] = Number(((total / 5) * 100).toFixed(2));
    });

    return optionScores;
  };

  /* -------------------------------------------------------
     STEP 6: SHOW RESULTS
  -------------------------------------------------------*/
  const renderResults = () => {
    if (!finalResult) return null;

    const scores = finalResult.saved.scores;
    const explanation = finalResult.explanation;
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    return (
      <div className="chat-section-bubble">
        <h3>The Best Option</h3>

        <p>Based on your priorities and ratings, here's what I found:</p>

        <div className="best-result-box">
          <strong>{sorted[0][0]}</strong>
          <span className="score-tag">{sorted[0][1].toFixed(1)}</span>
        </div>

        <p style={{ marginTop: "1rem" }}>Here's how the final scores compared:</p>

        <div className="scores-list">
          {sorted.map(([option, score]) => (
            <div key={option} className="score-row">
              <span>{option}</span>
              <span>{score.toFixed(1)}</span>
            </div>
          ))}
        </div>

        <div style={{ 
          marginTop: "1.5rem", 
          padding: "1rem", 
          background: "#f8f9fa", 
          borderRadius: "8px",
          lineHeight: "1.6"
        }}>
          <h4 style={{ marginTop: 0 }}>Why this choice?</h4>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{explanation}</p>
        </div>

        <p className="helper-text" style={{ marginTop: "1rem" }}>
          This score represents (importance × rating) summed across all categories.
        </p>

        <button
          className="primary-button"
          style={{ marginTop: "1rem" }}
          onClick={() => {
            // Reset for new decision
            setMessages([
              {
                id: 1,
                type: "bot",
                text: "Would you like help with another decision?",
              },
            ]);
            setPrompt("");
            setOptions([]);
            setCategories([]);
            setWeights({});
            setRatings({});
            setFinalResult(null);
            setStep(STEPS.ASK_QUESTION);
          }}
        >
          Make Another Decision
        </button>
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
          {messages.map((msg) => (
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
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isTyping}
            />

            <button 
              className="send-button" 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
            >
              {isTyping ? "..." : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}