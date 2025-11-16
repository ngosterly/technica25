import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import IntroPage from './pages/intro/IntroPage';
import ChatbotPage from './pages/chatbot/ChatbotPage';
import JournalPage from './pages/journal/JournalPage';
import CalendarPage from './pages/calendar/CalendarPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
