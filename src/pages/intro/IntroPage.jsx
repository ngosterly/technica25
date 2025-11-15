import { Link } from 'react-router-dom';
import './IntroPage.css';

const IntroPage = () => {
  return (
    <div className="intro-page">
      {/* hero section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Decisionera</h1>
          <p className="hero-subtitle">
            Making decisions shouldn't be overwhelming. We're here to help you navigate choices
            with clarity, care, and confidence.
          </p>
          <Link to="/chatbot" className="cta-button-hero">
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
              <div className="feature-icon">🧠</div>
              <h3>Mental Health First</h3>
              <p>
                We prioritize your well-being by avoiding triggering language and considering
                factors like anxiety impact, sleep quality, and stress levels.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚖️</div>
              <h3>Decision Matrix</h3>
              <p>
                Our engineering decision matrix weighs and scales categories that matter to you,
                providing clear insights without pressure.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📔</div>
              <h3>Journal Integration</h3>
              <p>
                Connect your journal entries with decision-making to provide context and
                track your emotional journey over time.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
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
      <section id="about-section" className="about-section">
        <div className="container">
          <h2>About Us</h2>
          <p className="about-text">
            Decisionera was created with the understanding that decision-making can be
            particularly challenging for those managing mental health concerns. We believe
            that technology should empower, not overwhelm.
          </p>
          
          <div className="principles">
            <div className="principle">
              <h4>Safe Language</h4>
              <p>
                We carefully avoid words with negative connotations like "failure" or
                "bad choice," focusing instead on growth and learning.
              </p>
            </div>
            
            <div className="principle">
              <h4>User Control</h4>
              <p>
                You're in charge. See why AI generates certain categories and remove
                any that don't serve you.
              </p>
            </div>
            
            <div className="principle">
              <h4>Privacy Focused</h4>
              <p>
                Your journal entries and decisions remain private. We don't store
                conversations between sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* developer about us */}
      <section className="developers-section">
        <div className="container">
          <h2>Meet the Team</h2>
          <p className="team-intro">
            Built with care by developers who understand the importance of mental health
            in technology.
          </p>
          
          <div className="team-grid">
            <div className="team-member">
              <div className="member-placeholder">👩‍💻</div>
              <h3>Developer Name</h3>
              <p className="member-role">Full Stack Developer</p>
              <p className="member-bio">
                Passionate about creating accessible, mental health-conscious technology.
              </p>
            </div>
            
            <div className="team-member">
              <div className="member-placeholder">👨‍💻</div>
              <h3>Developer Name</h3>
              <p className="member-role">UX/UI Designer</p>
              <p className="member-bio">
                Focused on designing calming, intuitive interfaces that reduce stress.
              </p>
            </div>
            
            <div className="team-member">
              <div className="member-placeholder">👩‍💻</div>
              <h3>Developer Name</h3>
              <p className="member-role">AI Integration</p>
              <p className="member-bio">
                Specializing in responsible AI that prioritizes user well-being.
              </p>
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
            <Link to="/chatbot" className="cta-button-primary">
              Try the Chatbot
            </Link>
            <Link to="/journal" className="cta-button-secondary">
              Start Journaling
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntroPage;
