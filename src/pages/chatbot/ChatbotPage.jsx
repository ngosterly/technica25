import { useState } from 'react';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm here to help you make decisions with care and clarity. What decision are you thinking about today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [includeJournal, setIncludeJournal] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input
    };

    setMessages([...messages, userMessage]);
    setInput('');
    
    // Simulate bot response (in production, this would call ChatGPT API)
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: "I understand you're thinking about this decision. Let me help you explore the different aspects. Would you like to see relevant categories for this decision?"
      };
      setMessages(prev => [...prev, botResponse]);
      setShowCategories(true);
    }, 1000);
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h1>Decision Assistant</h1>
          <p>Let's explore your decision together, thoughtfully and safely</p>
        </div>

        <div className="messages-container">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-bubble">
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {showCategories && (
          <div className="categories-section">
            <h3>Relevant Categories</h3>
            <div className="categories-grid">
              <div className="category-card">Regret Likelihood</div>
              <div className="category-card">Reversibility Score</div>
              <div className="category-card">Impact on Anxiety</div>
              <div className="category-card">Impact on Sleep</div>
            </div>
            <p className="category-note">
              <small>These categories were selected based on your preferences and the nature of your decision.</small>
            </p>
          </div>
        )}

        <div className="chatbot-controls">
          <label className="journal-toggle">
            <input
              type="checkbox"
              checked={includeJournal}
              onChange={(e) => setIncludeJournal(e.target.checked)}
            />
            <span>Include journal entries in analysis</span>
          </label>
        </div>

        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell me about your decision..."
            className="chat-input"
          />
          <button onClick={handleSend} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
