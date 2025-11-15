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
        </div>

        <div className="journal-book">
          <div className="left-page">
            <h1> left page </h1>
          </div>

          <div className="right-page">
            <h1> right page </h1>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default JournalPage;
