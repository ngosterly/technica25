import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import IntroPage from './pages/intro/IntroPage';
import DecisionPage from './pages/decision/DecisionPage';
import JournalPage from './pages/journal/JournalPage';
import AuthPage from './pages/auth/authPage';
import CalendarPage from './pages/calendar/CalendarPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/decision" element={<DecisionPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
