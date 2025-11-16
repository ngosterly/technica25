import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import IntroPage from './pages/intro/IntroPage';
import DecisionPage from './pages/decision/DecisionPage';
import JournalPage from './pages/journal/JournalPage';
import AuthPage from './pages/auth/authPage';
import CalendarPage from './pages/calendar/CalendarPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="app">
      {currentUser && <Navbar />}
      <Routes>
        <Route path="/auth" element={
          currentUser ? <Navigate to="/home" replace /> : <AuthPage />
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <IntroPage />
          </ProtectedRoute>
        } />
        <Route path="/decision" element={
          <ProtectedRoute>
            <DecisionPage />
          </ProtectedRoute>
        } />
        <Route path="/journal" element={
          <ProtectedRoute>
            <JournalPage />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
