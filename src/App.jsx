import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import IntroPage from './pages/intro/IntroPage';
import ChatbotPage from './pages/chatbot/ChatbotPage';
import JournalPage from './pages/journal/JournalPage';
import AuthPage from './pages/auth/authPage';
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
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
