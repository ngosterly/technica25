import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ChevronLeft, ChevronRight, MoodOutlined, LightbulbOutlined } from '@mui/icons-material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuBook from '@mui/icons-material/MenuBook';
import { getAllEntries, getEntryByDate, saveEntry } from '../../utils/journalStorage';
import { HappyFace, SadFace, MadFace, MehFace, NeutralFace, NoFace } from '../../components/MoodIcons';
import './CalendarPage.css';

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entriesMap, setEntriesMap] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [moodStats, setMoodStats] = useState({});
  const [statsInterval, setStatsInterval] = useState('month'); // 'month', '3months', 'year'
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [moodSelectorDate, setMoodSelectorDate] = useState(null);

  const moods = [
    { name: 'happy', color: '#FFD93D', label: 'Happy', icon: HappyFace },
    { name: 'sad', color: '#6badcbff', label: 'Sad', icon: SadFace },
    { name: 'mad', color: '#FF6B6B', label: 'Mad', icon: MadFace },
    { name: 'meh', color: '#8ed88cff', label: 'Anxious', icon: MehFace },
    { name: 'neutral', color: '#99cec5ff', label: 'Neutral', icon: NeutralFace },
    { name: 'noface', color: '#ffffffff', label: 'None', icon: NoFace}
  ];

  useEffect(() => {
    const entries = getAllEntries();
    setEntriesMap(entries);
    calculateMoodStats(entries, statsInterval);
  }, [statsInterval]);

  const calculateMoodStats = (entries, interval) => {
    const stats = {};
    let total = 0;
    const now = new Date();
    let startDate;

    if (interval === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (interval === '3months') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    } else if (interval === 'year') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    }

    Object.entries(entries).forEach(([dateKey, entry]) => {
      const entryDate = new Date(dateKey);
      if (entry.mood && entryDate >= startDate && entryDate <= now) {
        stats[entry.mood] = (stats[entry.mood] || 0) + 1;
        total++;
      }
    });

    const percentages = {};
    Object.keys(stats).forEach(mood => {
      percentages[mood] = ((stats[mood] / total) * 100).toFixed(1);
    });

    setMoodStats(percentages);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDateKey = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setShowModal(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getMoodIcon = (moodName) => {
    const mood = moods.find(m => m.name === moodName);
    return mood ? mood.icon : null;
  };

  const handleAddJournalEntry = () => {
    const dateKey = formatDateKey(selectedDate);
    setShowModal(false);
    navigate(`/journal?date=${dateKey}`);
  };

  const handleMoodClick = (e, date) => {
    e.stopPropagation();
    setMoodSelectorDate(date);
    setShowMoodSelector(true);
  };

  const handleMoodSelect = (moodName) => {
    const dateKey = formatDateKey(moodSelectorDate);
    const existingEntry = getEntryByDate(dateKey) || {};
    
    saveEntry(dateKey, {
      ...existingEntry,
      mood: moodName,
      updatedAt: new Date().toISOString()
    });

    // Refresh entries
    const entries = getAllEntries();
    setEntriesMap(entries);
    calculateMoodStats(entries, statsInterval);
    
    setShowMoodSelector(false);
    setMoodSelectorDate(null);
  };


  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        <div className="calendar-header">
          <IconButton onClick={handlePrevMonth} sx={{ color: '#6b6ad7e2' }}>
            <ChevronLeft />
          </IconButton>
          <h2>{monthYear}</h2>
          <IconButton onClick={handleNextMonth} sx={{ color: '#6b6ad7e2' }}>
            <ChevronRight />
          </IconButton>
        </div>

        {/* mood stats */}
        <div className="mood-statistics">
          <div className="mood-stats-header">
            <h3>Mood Breakdown</h3>
            <ToggleButtonGroup
              value={statsInterval}
              exclusive
              onChange={(e, newValue) => newValue && setStatsInterval(newValue)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: '#6b6ad7e2',
                  borderColor: '#ffc4df',
                  '&.Mui-selected': {
                    backgroundColor: '#ffc4df',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#a2b4f5',
                    }
                  }
                }
              }}
            >
              <ToggleButton value="month">Month</ToggleButton>
              <ToggleButton value="3months">3 Months</ToggleButton>
              <ToggleButton value="year">Year</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="mood-stats-grid">
            {moods.filter(mood => moodStats[mood.name]).map(mood => {
              const IconComponent = mood.icon;
              return (
                <div key={mood.name} className="mood-stat-item">
                  <IconComponent size={24} color={mood.color} />
                  <span className="mood-stat-label">{mood.label}</span>
                  <span className="mood-stat-percentage">{moodStats[mood.name]}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* calendar */}
        <div className="calendar-grid-container">
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday-label">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="calendar-day empty"></div>;
              }

              const dateKey = formatDateKey(date);
              const entry = getEntryByDate(dateKey);
              const hasMood = entry?.mood;
              const hasJournal = entry?.text;
              const hasDecision = false; // TODO: potentially implement decision tracking
              const isToday = formatDateKey(date) === formatDateKey(new Date());
              
              const MoodIcon = hasMood ? getMoodIcon(hasMood) : null;
              const moodData = moods.find(m => m.name === hasMood);

              return (
                <div
                  key={index}
                  className={`calendar-day ${isToday ? 'today' : ''} ${hasMood || hasJournal || hasDecision ? 'has-data' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="day-number">{date.getDate()}</div>
                  
                  {/* mood icon */}
                  {MoodIcon && (
                    <div className="day-mood-icon">
                      <MoodIcon size={40} color={moodData?.color} />
                    </div>
                  )}
                  
                  {/* indicators per day */}
                  <div className="day-indicators">
                    {hasJournal && (
                      <IconButton size="small" sx={{ padding: '2px', color: '#6b6ad7e2' }}>
                        <MenuBook fontSize="medium" />
                      </IconButton>
                    )}
                    {hasDecision && (
                      <IconButton size="small" sx={{ padding: '2px', color: '#a2b4f5' }}>
                        <LightbulbOutlined fontSize="medium" />
                      </IconButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* modal for selected date */}
      {showModal && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-actions">
                <button className="action-button mood-action" onClick={(e) => {
                  setShowModal(false);
                  handleMoodClick(e, selectedDate);
                }}>
                  <MoodOutlined /> Add/Edit Mood
                </button>
                <button className="action-button journal-action" onClick={handleAddJournalEntry}>
                  <MenuBookIcon /> Add/Edit Journal Entry
                </button>
                <button className="action-button decision-action">
                  <LightbulbOutlined /> View Decisions
                </button>
              </div>

              {(() => {
                const dateKey = formatDateKey(selectedDate);
                const entry = getEntryByDate(dateKey);
                if (entry) {
                  return (
                    <div className="current-data">
                      {entry.mood && (
                        <div className="current-mood">
                          <strong>Current Mood:</strong> {moods.find(m => m.name === entry.mood)?.label}
                        </div>
                      )}
                      {entry.text && (
                        <div className="current-journal">
                          <strong>Journal Entry:</strong>
                          <p>{entry.text}</p>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {/* mood popup */}
      {showMoodSelector && moodSelectorDate && (
        <div className="modal-overlay" onClick={() => setShowMoodSelector(false)}>
          <div className="mood-selector-modal" onClick={e => e.stopPropagation()}>
            <div className="mood-selector-header">
              <h3>Select Mood for {moodSelectorDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h3>
              <button className="modal-close" onClick={() => setShowMoodSelector(false)}>×</button>
            </div>
            <div className="mood-selector-grid">
              {moods.slice(0, -1).map((mood) => {
                const MoodIconComponent = mood.icon;
                const dateKey = formatDateKey(moodSelectorDate);
                const currentEntry = getEntryByDate(dateKey);
                const isSelected = currentEntry?.mood === mood.name;
                
                return (
                  <div
                    key={mood.name}
                    className={`mood-selector-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleMoodSelect(mood.name)}
                    style={{
                      borderColor: isSelected ? mood.color : '#e9ecef',
                      backgroundColor: isSelected ? `${mood.color}15` : 'white'
                    }}
                  >
                    <MoodIconComponent size={48} color={mood.color} />
                    <span className="mood-selector-label">{mood.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
