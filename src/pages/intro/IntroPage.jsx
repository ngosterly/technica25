import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './IntroPage.css';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BalanceIcon from '@mui/icons-material/Balance';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CodeIcon from '@mui/icons-material/Code';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PetsIcon from '@mui/icons-material/Pets';
import MoodIcon from '@mui/icons-material/Mood';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { IconButton } from '@mui/material';
import teamPhoto from '../../assets/us.JPG';

const IntroPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="intro-page">
      {/* hero section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Decisionera</h1>
          <p className="hero-subtitle">
            Making decisions shouldn't be spooky. We're here to help you navigate choices
            with clarity, care, and confidence.
          </p>
          <Link to="/decision" className="cta-button-hero">
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* mission statements */}
      <section className="mission-section">
        <div className="container">
          <h2>Our Mission</h2>
          <p className="mission-text">
            Decisionera is designed to support your mental well-being while helping you make
            important decisions. We use a thoughtful, category-based approach that considers
            your unique needs, preferences, and mental health considerations.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><PsychologyIcon sx={{ fontSize: 60, color: '#6b6ad7e2' }} /></div>
              <h3>Mental Health First</h3>
              <p>
                We prioritize your well-being by avoiding triggering language and considering
                factors like anxiety impact, sleep quality, and stress levels.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><BalanceIcon sx={{ fontSize: 60, color: '#6b6ad7e2' }} /></div>
              <h3>Decision Matrix</h3>
              <p>
                Our engineering decision matrix weighs and scales categories that matter to you,
                providing clear insights without pressure.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><MenuBookIcon sx={{ fontSize: 60, color: '#6b6ad7e2' }} /></div>
              <h3>Journal Integration</h3>
              <p>
                Connect your journal entries with decision-making to provide context and
                track your emotional journey over time.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><TrackChangesIcon sx={{ fontSize: 60, color: '#6b6ad7e2' }} /></div>
              <h3>Personalized Categories</h3>
              <p>
                Choose the categories that matter most to you, from regret likelihood to
                reversibility scores and energy requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* about us section */}
      <section className="about-section">
        <div className="container">
          <h2 style={{ textAlign: 'center' }}>About Us</h2>
          
          <div className="about-content-wrapper">
            <div className="about-left">
              <p className="about-text">
                Decisionera was created at Technica 2025, the world's largest all-women and non-binary hackathon. 
                We understand that decision-making can be particularly challenging for those managing mental health concerns. 
                We believe that technology should empower, not overwhelm.
              </p>
              
              <div className="principles-grid">
                <div className="principle-card">
                  <h4>Safe Language</h4>
                  <p>
                    We carefully avoid words with negative connotations like "failure" or
                    "bad choice," focusing instead on growth and learning.
                  </p>
                </div>
                
                <div className="principle-card">
                  <h4>User Control</h4>
                  <p>
                    You're in charge. See why AI generates certain categories and remove
                    any that don't serve you.
                  </p>
                </div>
                
                <div className="principle-card">
                  <h4>Mood Tracking & Insights</h4>
                  <p>
                    Track your daily moods with our intuitive mood tracker. Visualize emotional patterns 
                    over time and understand how your feelings influence your decision-making process.
                  </p>
                </div>
                
                <div className="principle-card hackathon-card">
                  <div className="hackathon-icon">
                    <EmojiEventsIcon sx={{ fontSize: 40, color: '#6b6ad7e2' }} />
                  </div>
                  <h4>Our First Hackathon!</h4>
                  <p>
                    Built with passion and dedication at Technica 2025, our debut project represents 
                    our commitment to meaningful innovation.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="about-right">
              <img src={teamPhoto} alt="Team at Technica 2025" className="team-photo" />
            </div>
          </div>
        </div>
      </section>

      {/* developer about us */}
      <section className="developers-section">
        <div className="container">
          <h2>Meet the Team</h2>
          <p className="team-intro">
            Built at Technica 2025 by a team of passionate full-stack developers who understand 
            the importance of mental health in technology.
          </p>
          
          <div className="team-grid">
            <div className="team-member">
              <div className="member-placeholder"><CodeIcon sx={{ fontSize: 80, color: '#6b6ad7e2' }} /></div>
              <h3>Lilly Ngo</h3>
              <p className="member-role">Full Stack Developer</p>
              <p className="member-bio">
                Creating empathetic tech solutions that bridge the gap between mental wellness and productivity.
              </p>
              <div className="member-links">
                <a href="https://www.linkedin.com/in/lillyn-g" target="_blank" rel="noopener noreferrer">
                  <LinkedInIcon sx={{ fontSize: 24, color: '#6b6ad7e2' }} />
                </a>
              </div>
            </div>
            
            <div className="team-member">
              <div className="member-placeholder">
                <DesignServicesIcon sx={{ fontSize: 80, color: '#6b6ad7e2' }} />
                <PetsIcon sx={{ fontSize: 25, color: '#6b6ad7e2', position: 'absolute', marginLeft: '-5px', marginTop: '50px' }} />
              </div>
              <h3>Layla Phipps</h3>
              <p className="member-role">Full Stack Developer</p>
              <p className="member-bio">
                Designing intuitive interfaces with a focus on user experience and emotional well-being.
              </p>
              <div className="member-links">
                <a href="https://www.linkedin.com/in/layla-phipps-281980341/" target="_blank" rel="noopener noreferrer">
                  <LinkedInIcon sx={{ fontSize: 24, color: '#6b6ad7e2' }} />
                </a>
              </div>
            </div>

            <div className="team-member">
              <div className="member-placeholder"><DeveloperModeIcon sx={{ fontSize: 80, color: '#6b6ad7e2' }} /></div>
              <h3>Tommy Brozek</h3>
              <p className="member-role">Full Stack Developer</p>
              <p className="member-bio">
                Building UI components and systems that prioritize accessibility and mental health support.
              </p>
              <div className="member-links">
                <a href="https://www.instagram.com/tommybrozek?igsh=cWxxbmxrZGgxbGhv" target="_blank" rel="noopener noreferrer">
                  <InstagramIcon sx={{ fontSize: 24, color: '#6b6ad7e2' }} />
                </a>
              </div>
            </div>
        
            <div className="team-member">
              <div className="member-placeholder"><SmartToyIcon sx={{ fontSize: 80, color: '#6b6ad7e2' }} /></div>
              <h3>Brennen Mccorison</h3>
              <p className="member-role">Full Stack Developer</p>
              <p className="member-bio">
                Integrating AI thoughtfully to create supportive, user-centered decision-making tools.
              </p>
              <div className="member-links">
                <a href="https://www.linkedin.com/in/brennen-mccorison-a68786267/" target="_blank" rel="noopener noreferrer">
                  <LinkedInIcon sx={{ fontSize: 24, color: '#6b6ad7e2' }} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* bottom rereouter section */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to Start?</h2>
          <p>Take the first step toward clearer, more confident decision-making.</p>
          <div className="cta-buttons">
            <Link to="/decision" className="cta-button-primary">
              Try the Decision Maker
            </Link>
            <Link to="/journal" className="cta-button-secondary">
              Start Journaling
            </Link>
            <a 
              href="https://github.com/ngosterly/technica25" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-button"
            >
              <GitHubIcon sx={{ fontSize: 24, marginRight: '8px' }} />
              View on GitHub
            </a>
          </div>
          {/* <div className="github-section">
            
          </div> */}
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <IconButton
          onClick={scrollToTop}
          className="scroll-to-top"
          sx={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#6b6ad7e2',
            color: 'white',
            '&:hover': {
              backgroundColor: '#a2b4f5',
            },
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 30 }} />
        </IconButton>
      )}
    </div>
  );
};

export default IntroPage;
