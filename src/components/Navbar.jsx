import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import './Navbar.css';
import logo from '../assets/logo.png';
import homeIcon from '../assets/home.png';
import decideIcon from '../assets/decide.png';
import journalIcon from '../assets/journal.png';
import calendarIcon from '../assets/calender.png';
import LogoutIcon from '@mui/icons-material/Logout';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      setLogoutDialogOpen(false);
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
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
            <Link to="/home" className="nav-icon-link">
              <img src={homeIcon} alt="Home" className="nav-icon" />
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/decision" className="nav-icon-link">
              <img src={decideIcon} alt="Decision Maker" className="nav-icon" />
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/journal" className="nav-icon-link">
              <img src={journalIcon} alt="Journal" className="nav-icon" />
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/calendar" className="nav-icon-link">
              <img src={calendarIcon} alt="Calendar" className="nav-icon" />
            </Link>
          </li>

          <li className="auth">
            <button onClick={handleLogoutClick} className="nav-link logout-btn">
              <LogoutIcon sx={{ fontSize: 20 }} />
              
            </button>
          </li>
        </ul>
      </div>

      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          Are you sure you want to logout?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} sx={{ color: '#6b6ad7e2' }}>
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} sx={{ color: '#6b6ad7e2' }} autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </nav>
  );
};

export default Navbar;
