import { useState, useEffect } from 'react';
import { getAllEntries, hasEntryForDate, getEntryByDate, saveEntry } from '../../utils/journalStorage';
import { HappyFace, SadFace, MadFace, MehFace, NeutralFace, NoFace } from '../../components/MoodIcons';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import './JournalPage.css';

const JournalPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [entriesMap, setEntriesMap] = useState({});

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
  }, []);

  const getWeekDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const currentDay = new Date(year, month, day);
    const dayOfWeek = currentDay.getDay();
    
    const startOfWeek = new Date(currentDay);
    startOfWeek.setDate(day - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(startOfWeek);
      weekDay.setDate(startOfWeek.getDate() + i);
      days.push(weekDay);
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
    const dateKey = formatDateKey(date);
    const entry = getEntryByDate(dateKey);
    if (entry && entry.mood) {
      setSelectedMood(entry.mood);
    } else {
      setSelectedMood(null);
    }
  };

  const handleMoodSelect = (moodName) => {
    setSelectedMood(moodName);
    
    if (selectedDate) {
      const dateKey = formatDateKey(selectedDate);
      const existingEntry = getEntryByDate(dateKey) || {};
      
      // Save the mood to localStorage
      saveEntry(dateKey, {
        ...existingEntry,
        mood: moodName
      });
      
      // Refresh entries
      const updatedEntries = getAllEntries();
      setEntriesMap(updatedEntries);
    }
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getWeekRange = () => {
    const days = getWeekDays(currentDate);
    const firstDay = days[0];
    const lastDay = days[6];
    
    const firstMonth = firstDay.toLocaleDateString('en-US', { month: 'short' });
    const lastMonth = lastDay.toLocaleDateString('en-US', { month: 'short' });
    const year = firstDay.getFullYear();
    
    if (firstMonth === lastMonth) {
      return `${firstMonth} ${firstDay.getDate()}-${lastDay.getDate()}, ${year}`;
    } else {
      return `${firstMonth} ${firstDay.getDate()} - ${lastMonth} ${lastDay.getDate()}, ${year}`;
    }
  };

  const formatDayLabel = (date) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    
    const suffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${dayOfWeek}. ${month} ${day}${suffix(day)}`;
  };

  const getMoodIcon = (moodName) => {
    const mood = moods.find(m => m.name === moodName);
    return mood ? mood.icon : null;
  };

  const weekRange = getWeekRange();
  const days = getWeekDays(currentDate);

  return (
    <div className="journal-page">
      <div className="journal-layout">
        <div className="calendar-section">
          {/* <div className="calendar-header"> */}
            {/* <button onClick={handlePrevWeek} className="month-nav">←</button> */}
            {/* <h2>{weekRange}</h2> */}

          <IconButton 
            aria-label="back" 
            onClick={handlePrevWeek}
            sx={{
              width: 36,
              height: 36,
              border: '2px solid #667eea',
              borderRadius: '50%',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: '#667eea',
                '& svg': {
                  color: 'white'
                }
              }
            }}
          >
            <ArrowBackIosIcon sx={{ color: '#667eea', fontSize: 18 }} />
          </IconButton>
            
          {/* </div> */}
          
          <div className="calendar-grid">
            {days.map((date, index) => {
              const dateKey = formatDateKey(date);
              const entry = getEntryByDate(dateKey);
              const hasEntry = !!entry;
              const isSelected = selectedDate && formatDateKey(selectedDate) === dateKey;
              const isToday = formatDateKey(date) === formatDateKey(new Date());
              const MoodIcon = entry?.mood ? getMoodIcon(entry.mood) : null;
              const moodColor = entry?.mood ? moods.find(m => m.name === entry.mood)?.color : null;
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${hasEntry ? 'has-entry' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="day-label-text">{formatDayLabel(date)}</div>
                  {MoodIcon && (
                    <div className="day-mood-icon">
                      <MoodIcon size={48} color={isSelected ? 'white' : moodColor} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <IconButton 
            aria-label="forward" 
            onClick={handleNextWeek}
            sx={{
              width: 36,
              height: 36,
              border: '2px solid #667eea',
              borderRadius: '50%',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: '#667eea',
                '& svg': {
                  color: 'white'
                }
              }
            }}
          >
            <ArrowForwardIosIcon sx={{ color: '#667eea', fontSize: 18 }} />
          </IconButton>
          {/* <button onClick={handleNextWeek} className="month-nav">→</button> */}
        </div>

        <div className="content-wrapper">
          {/* <div className="left-panel">
          </div> */}
          {/* journal entry component (placeholder) */}
          <div className="journal-entry-area">
            
          </div>

          {/* highlighters */}
          <div className="right-panel">
            <h3>Today's Mood:</h3>
            <div className="mood-highlighters">
              {moods.map((mood) => {
                const IconComponent = mood.icon;
                return (
                  <div
                    key={mood.name}
                    className={`mood-highlighter ${selectedMood === mood.name ? 'selected' : ''} ${mood.name === 'noface' ? 'noface-mood' : ''}`}
                    style={{ '--mood-color': mood.color }}
                    onClick={() => handleMoodSelect(mood.name)}
                    title={mood.label}
                  >
                    <IconComponent size={28} color={mood.color} />
                    <span className="mood-label">{mood.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default JournalPage;
