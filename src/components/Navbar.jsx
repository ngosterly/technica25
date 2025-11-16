import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src={logo} alt="Decisionera Logo" className="nav-logo-img" />
          Decisionera
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/home" className={isActive('/home')}>
              Home
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/decision" className={isActive('/decision')}>
              Decision Maker
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/journal" className={isActive('/journal')}>
              Journal
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/calendar" className={isActive('/calendar')}>
              Calendar
            </Link>
          </li>

          <li className="auth">
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
