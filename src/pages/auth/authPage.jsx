import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import logo from '../../assets/logo.png';

// Your Firebase configuration
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
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });

  // Handle Email Login
  const handleEmailLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        loginData.email, 
        loginData.password
      );
      console.log('Login successful:', userCredential.user);
      // Redirect to your app's main page
      // window.location.href = '/dashboard';
      alert('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message}`);
    }
  };

  // Handle Email Registration
  const handleEmailRegister = async () => {
    if (registerData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        registerData.email, 
        registerData.password
      );
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: registerData.name
      });

      console.log('Registration successful:', userCredential.user);
      // Redirect to your app's main page
      // window.location.href = '/dashboard';
      alert('Account created successfully!');
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error.message}`);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful:', result.user);
      // Redirect to your app's main page
      // window.location.href = '/dashboard';
      alert('Google sign-in successful!');
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert(`Google sign-in failed: ${error.message}`);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={styles.authBox}>
          <div style={styles.logoSection}>
            <img src={logo} alt="Logo" style={styles.logo} />
          </div>

          {isLogin ? (
            // Login Form
            <div style={styles.formContainer}>
              <h2 style={styles.title}>Welcome Back</h2>
              <p style={styles.subtitle}>Sign in to continue</p>

              <div style={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
                  style={styles.input}
                />
              </div>
              <button onClick={handleEmailLogin} style={styles.btnPrimary}>
                Sign In
              </button>

              <div style={styles.divider}>
                <div style={styles.dividerLine}></div>
                <span style={styles.dividerText}>or</span>
                <div style={styles.dividerLine}></div>
              </div>

              <button onClick={handleGoogleSignIn} style={styles.btnGoogle}>
                <span style={styles.googleIcon}></span>
                Continue with Google
              </button>

              <p style={styles.switchForm}>
                Don't have an account?{' '}
                <span onClick={() => setIsLogin(false)} style={styles.link}>
                  Create one
                </span>
              </p>
            </div>
          ) : (
            // Register Form
            <div style={styles.formContainer}>
              <h2 style={styles.title}>Create Account</h2>
              <p style={styles.subtitle}>Join us today</p>

              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailRegister()}
                  style={styles.input}
                />
              </div>
              <button onClick={handleEmailRegister} style={styles.btnPrimary}>
                Create Account
              </button>

              <div style={styles.divider}>
                <div style={styles.dividerLine}></div>
                <span style={styles.dividerText}>or</span>
                <div style={styles.dividerLine}></div>
              </div>

              <button onClick={handleGoogleSignIn} style={styles.btnGoogle}>
                <span style={styles.googleIcon}></span>
                Sign up with Google
              </button>

              <p style={styles.switchForm}>
                Already have an account?{' '}
                <span onClick={() => setIsLogin(true)} style={styles.link}>
                  Sign in
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    // Placeholder background - replace with your image texture
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    // To use image texture: backgroundImage: 'url("path/to/your/background-texture.jpg")',
    // backgroundSize: 'cover',
    // backgroundPosition: 'center',
    // backgroundAttachment: 'fixed',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '450px',
  },
  authBox: {
    // Placeholder background - replace with your image texture
    background: 'rgba(255, 255, 255, 0.95)',
    // To use image texture: backgroundImage: 'url("path/to/your/card-texture.jpg")',
    // backgroundSize: 'cover',
    // backgroundPosition: 'center',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logo: {
    width: '80px',
    height: '80px',
    margin: '0 auto',
    display: 'block',
    objectFit: 'contain',
  },
  formContainer: {
    animation: 'fadeIn 0.3s ease-in',
  },
  title: {
    color: '#333',
    marginBottom: '8px',
    fontSize: '28px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '14px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    background: 'white',
    // To use input texture: backgroundImage: 'url("path/to/your/input-texture.png")',
    // backgroundSize: 'cover',
    boxSizing: 'border-box',
  },
  btnPrimary: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    // Placeholder background - replace with your button texture
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    // To use button texture: backgroundImage: 'url("path/to/your/button-texture.jpg")',
    // backgroundSize: 'cover',
    color: 'white',
    marginBottom: '20px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '25px 0',
    color: '#999',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e0e0e0',
  },
  dividerText: {
    padding: '0 15px',
    fontSize: '13px',
  },
  btnGoogle: {
    width: '100%',
    padding: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'white',
    // To use button texture: backgroundImage: 'url("path/to/your/google-button-texture.jpg")',
    // backgroundSize: 'cover',
    color: '#333',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  googleIcon: {
    width: '20px',
    height: '20px',
    // Placeholder - replace with Google icon image
    background: '#EA4335',
    // To use Google icon: backgroundImage: 'url("path/to/your/google-icon.png")',
    // backgroundSize: 'contain',
    // backgroundRepeat: 'no-repeat',
    // backgroundPosition: 'center',
    borderRadius: '2px',
  },
  switchForm: {
    textAlign: 'center',
    color: '#666',
    fontSize: '14px',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
  },
};