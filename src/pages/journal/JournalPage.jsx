import { useState } from 'react';
import { Link } from 'react-router-dom';
import './JournalPage.css';

const JournalPage = () => {
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: '2025-11-10',
      title: 'Weekend Plans',
      content: 'Trying to decide if I should go to the party or stay home...',
      mood: 'thoughtful',
      tags: ['social', 'self-care']
    }
  ]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: ''
  });

  const handleCreateEntry = () => {
    if (!newEntry.title || !newEntry.content) return;

    const entry = {
      id: entries.length + 1,
      date: new Date().toISOString().split('T')[0],
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood || 'neutral',
      tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    setEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '', mood: '', tags: '' });
    setShowNewEntry(false);
  };

  return (
    <div className="journal-page">
      <div className="journal-container">
        <div className="journal-header">
          <h1>Your Journal</h1>
          <p>Reflect on your thoughts and decisions in a safe space</p>
          <button 
            className="new-entry-button"
            onClick={() => setShowNewEntry(!showNewEntry)}
          >
            {showNewEntry ? '× Cancel' : '+ New Entry'}
          </button>
        </div>

        {showNewEntry && (
          <div className="new-entry-form">
            <input
              type="text"
              placeholder="Entry title..."
              value={newEntry.title}
              onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
              className="entry-input"
            />
            <textarea
              placeholder="What's on your mind?&#10;&#10;This is a safe space to explore your thoughts..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
              className="entry-textarea"
              rows="8"
            />
            <div className="entry-meta">
              <input
                type="text"
                placeholder="How are you feeling?"
                value={newEntry.mood}
                onChange={(e) => setNewEntry({...newEntry, mood: e.target.value})}
                className="mood-input"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={newEntry.tags}
                onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                className="tags-input"
              />
            </div>
            <button onClick={handleCreateEntry} className="save-entry-button">
              Save Entry
            </button>
          </div>
        )}

        <div className="entries-list">
          {entries.length === 0 ? (
            <div className="empty-state">
              <p>No journal entries yet.</p>
              <p>Start writing to track your thoughts and decisions!</p>
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <h3>{entry.title}</h3>
                  <span className="entry-date">{entry.date}</span>
                </div>
                <p className="entry-content">{entry.content}</p>
                <div className="entry-footer">
                  {entry.mood && (
                    <span className="mood-badge">{entry.mood}</span>
                  )}
                  <div className="tags">
                    {entry.tags.map((tag, idx) => (
                      <span key={idx} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="journal-cta">
          <p>Want to use your journal entries to inform your decisions?</p>
          <Link to="/chatbot" className="cta-button">
            Go to Chatbot →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
