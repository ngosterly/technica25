import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Decisionera
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className={isActive('/')}>
              Home
            </Link>
          </li>
          
          <li className="nav-item">
            <Link to="/chatbot" className={isActive('/chatbot')}>
              Chatbot
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
