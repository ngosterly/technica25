import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCl44oL6TMHWiqFjUgL6ErLY8JenzqzxYI",
  authDomain: "decisionera-67322.firebaseapp.com",
  databaseURL: "https://decisionera-67322-default-rtdb.firebaseio.com",
  projectId: "decisionera-67322",
  storageBucket: "decisionera-67322.firebasestorage.app",
  messagingSenderId: "770765484496",
  appId: "1:770765484496:web:0f6b13c279c6f6c69c89d5",
  measurementId: "G-RERKVST1HK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
