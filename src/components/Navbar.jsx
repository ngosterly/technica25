import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const scrollToAbout = (e) => {
    if (location.pathname !== '/') {
      return;
    }
    // scroll to about section on intropage
    e.preventDefault();
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
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
            {location.pathname === '/' ? (
              <a 
                href="#about-section" 
                className="nav-link"
                onClick={scrollToAbout}
              >
                About
              </a>
            ) : (
              <Link to="/#about-section" className="nav-link">
                About
              </Link>
            )}
          </li>

          <li className="auth">
            <Link to="/auth" className={isActive('/auth')}>
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
