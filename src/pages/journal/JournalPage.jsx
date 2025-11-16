import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IconButton, Button } from '@mui/material';
import { Edit, Save, Close, ChevronLeft, ChevronRight, Today, Add } from '@mui/icons-material';
import { getAllEntries, saveEntry, getEntryByDate } from '../../utils/firebaseJournalStorage';
import { HappyFace, SadFace, MadFace, MehFace, NeutralFace, NoFace } from '../../components/MoodIcons';
// import HappyGhost from '../../components/HappyGhost';
import { useAuth } from '../../contexts/AuthContext';
import ghostImg from '../../assets/ghost.png';
import './JournalPage.css';

const JournalPage = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(true);

  const moods = [
    { name: 'happy', color: '#FFD93D', label: 'Happy', icon: HappyFace },
    { name: 'sad', color: '#6badcbff', label: 'Sad', icon: SadFace },
    { name: 'mad', color: '#FF6B6B', label: 'Mad', icon: MadFace },
    { name: 'meh', color: '#8ed88cff', label: 'Anxious', icon: MehFace },
    { name: 'neutral', color: '#99cec5ff', label: 'Neutral', icon: NeutralFace },
    { name: 'noface', color: '#e0e0e0', label: 'None', icon: NoFace }
  ];

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  async function getWeekEntries(weekStart) {
    if (!currentUser) return [];

    const week = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const entry = await getEntryByDate(currentUser.uid, dateKey);
      week.push({
        date: dateKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        ...entry
      });
    }
    return week;
  }

  useEffect(() => {
    if (currentUser) {
      loadAllEntries();

      // check if a date is specified in URL params
      const dateParam = searchParams.get('date');
      if (dateParam) {
        getEntryByDate(currentUser.uid, dateParam).then(entry => {
          if (entry) {
            setSelectedEntry({ date: dateParam, ...entry });
            setJournalText(entry.text || '');
          } else {
            setCurrentDate(dateParam);
            setSelectedEntry({ date: dateParam });
            setEditMode(true);
          }
        });
        setSearchParams({});
      }
    }
  }, [currentUser, searchParams, setSearchParams, currentWeekStart]);

  const loadAllEntries = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const entriesMap = await getAllEntries(currentUser.uid);
      // convert to array and sort by date (newest first)
      const entriesArray = Object.entries(entriesMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(entriesArray);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEntriesByWeek = () => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    // create all 7 days of the week, even if no entry exists
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      // find an existing entry for this date
      const existingEntry = entries.find(entry => entry.date === dateKey);
      
      weekDays.push({
        date: dateKey,
        text: existingEntry?.text || '',
        mood: existingEntry?.mood || null,
        updatedAt: existingEntry?.updatedAt || null
      });
    }
    
    return weekDays;
  };

  const handleSelectEntry = (entry) => {
    setIsFlipping(true);
    setTimeout(() => {
      setSelectedEntry(entry);
      setJournalText(entry.text || '');
      setSelectedMood(entry.mood || null);
      setEditMode(false);
      setIsFlipping(false);
    }, 300);
  };

  const handleNewEntry = async () => {
    if (!currentUser) return;

    const today = new Date().toISOString().split('T')[0];
    const existingEntry = await getEntryByDate(currentUser.uid, today);

    setCurrentDate(today);
    setJournalText(existingEntry?.text || '');
    setSelectedMood(existingEntry?.mood || null);
    setSelectedEntry(existingEntry ? { date: today, ...existingEntry } : { date: today });
    setEditMode(true);
  };

  const handleSaveEntry = async () => {
    if (!currentUser) return;

    if (!journalText.trim() && !selectedMood) {
      alert('Please write something or select a mood before saving!');
      return;
    }

    const existingEntry = await getEntryByDate(currentUser.uid, currentDate) || {};

    await saveEntry(currentUser.uid, currentDate, {
      ...existingEntry,
      text: journalText,
      mood: selectedMood,
      updatedAt: new Date().toISOString()
    });

    await loadAllEntries();
    setEditMode(false);

    // updating selected entry
    const updatedEntry = await getEntryByDate(currentUser.uid, currentDate);
    setSelectedEntry({ date: currentDate, ...updatedEntry });
  };

  const handleMoodSelect = (moodName) => {
    setSelectedMood(moodName === selectedMood ? null : moodName);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (selectedEntry) {
      setJournalText(selectedEntry.text || '');
    }
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPreview = (text) => {
    if (!text) return 'No content';
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const getMoodIcon = (moodName) => {
    const mood = moods.find(m => m.name === moodName);
    return mood ? { icon: mood.icon, color: mood.color } : null;
  };

  const handlePrevWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const filteredEntries = getFilteredEntriesByWeek();

  if (loading) {
    return (
      <div className="journal-page">
        <div className="journal-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading your journal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page">
      <div className="journal-container">
        <div className="entries-sidebar">
          <div className="sidebar-header">
            <h2>Journal Entries</h2>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNewEntry}
              sx={{
                width: '100%',
                backgroundColor: 'white',
                color: '#6b6ad7e2',
                '&:hover': {
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              New Entry
            </Button>
          </div>

          <div className="week-navigation">
            <IconButton onClick={handlePrevWeek} size="small" sx={{ color: '#6b6ad7e2' }}>
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={handleToday} size="small" sx={{ color: '#6b6ad7e2' }}>
              <Today />
            </IconButton>
            <IconButton onClick={handleNextWeek} size="small" sx={{ color: '#6b6ad7e2' }}>
              <ChevronRight />
            </IconButton>
          </div>

          <div className="entries-list">
            {filteredEntries.length === 0 ? (
              <div className="no-entries">
                <p>No entries this week.</p>
                <p>Click "New Entry" to start!</p>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const moodData = entry.mood ? getMoodIcon(entry.mood) : null;
                const MoodIcon = moodData?.icon;
                const hasContent = entry.text && entry.text.trim().length > 0;
                
                return (
                  <div
                    key={entry.date}
                    className={`entry-item ${selectedEntry?.date === entry.date ? 'active' : ''} ${!hasContent ? 'empty-entry' : ''}`}
                    onClick={() => handleSelectEntry(entry)}
                  >
                    <div className="entry-date">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="entry-preview">
                      {hasContent ? getPreview(entry.text) : 'No entry yet'}
                    </div>
                    {MoodIcon && (
                      <div className="entry-mood-icon">
                        <MoodIcon size={32} color={moodData.color} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="journal-content">
          {selectedEntry ? (
            <div className={`flip-card ${isFlipping ? 'flipped' : ''}`}>
              <div className="flip-card-inner">
                {/* Front side - Journal entry */}
                <div className="flip-card-front journal-entry-paper">
                  <div className="journal-page-lines"></div>
                  <div className="entry-header">
                    <h1>{formatDisplayDate(selectedEntry.date)}</h1>
                    {!editMode && (
                      <IconButton onClick={() => setEditMode(true)} sx={{ color: '#6b6ad7e2' }}>
                        <Edit />
                      </IconButton>
                    )}
                  </div>

                  {editMode ? (
                    <div className="edit-mode">
                      <textarea
                        className="journal-textarea"
                        value={journalText}
                        onChange={(e) => setJournalText(e.target.value)}
                        placeholder="Write your thoughts here..."
                        autoFocus
                      />
                      <div className="edit-actions">
                        <IconButton onClick={handleSaveEntry} sx={{ color: '#000' }}>
                          <Save />
                        </IconButton>
                        <IconButton onClick={handleCancelEdit} sx={{ color: '#757575' }}>
                          <Close />
                        </IconButton>
                      </div>
                    </div>
                  ) : (
                    <div className="entry-text">
                      {selectedEntry.text || 'No content yet. Click "Edit" to add some!'}
                    </div>
                  )}

                  {selectedEntry.updatedAt && (
                    <div className="entry-meta">
                      Last updated: {new Date(selectedEntry.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flip-card-back">
                  <h1>{formatDisplayDate(selectedEntry.date)}</h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <h2>Welcome to your Journal</h2>
                <p>Select an entry from the list or create a new one to get started.</p>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleNewEntry}
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #ffc4df 0%, #a2b4f5 100%)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '16px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  Create Your First Entry
                </Button>
              </div>
              <img src={ghostImg} alt="Happy Ghost" className="ghost-animation" />
            </div>
          )}
        </div>

        {editMode && selectedEntry && (
          <div className="mood-sidebar">
            <h3>Today's Mood:</h3>
            <div className="mood-options">
              {moods.slice(0, -1).map((mood) => {
                const MoodIconComponent = mood.icon;
                return (
                  <div
                    key={mood.name}
                    className={`mood-option ${selectedMood === mood.name ? 'selected' : ''}`}
                    onClick={() => handleMoodSelect(mood.name)}
                  >
                    <div className="mood-icon-wrapper">
                      <MoodIconComponent size={40} color={mood.color} />
                    </div>
                    <span className="mood-label">{mood.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalPage;
