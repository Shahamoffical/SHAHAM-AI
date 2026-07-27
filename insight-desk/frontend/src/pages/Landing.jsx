import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import { useTheme } from "../context/ThemeContext";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/research");
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="verix-landing">
      {/* Auth Modal Popup */}
      {showAuthModal && (
        <Login isModal={true} onClose={() => setShowAuthModal(false)} />
      )}
      {/* Background Graphic */}
      <div className="verix-bg-wrap">
        <img
          src="/verix_hero_bg.png"
          alt="SHAHAM Intelligent AI Adaptation"
          className="verix-bg-image"
        />
        <div className="verix-bg-overlay" />
      </div>

      {/* Header / Navbar */}
      <header className="verix-header">
        <div className="verix-brand" onClick={() => navigate("/")}>
          SHAHAM
        </div>

        <nav className="verix-nav-pills">
          <button className="verix-pill-item" onClick={() => navigate("/platform")}>
            Platform
          </button>
          <button className="verix-pill-item" onClick={() => navigate("/solutions")}>
            Solutions
          </button>
          <button className="verix-pill-item" onClick={() => navigate("/ai-engine")}>
            AI Engine
          </button>
          <button className="verix-pill-item" onClick={handleGetStarted}>
            Research
          </button>
        </nav>

        <div className="verix-header-actions">
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="verix-theme-toggle"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button className="verix-btn-started" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="verix-hero-content">
        <h1 className="verix-hero-title">
          INTERFACES POWERED<br />
          BY INTELLIGENT<br />
          <span className="verix-hero-accent">ADAPTATION</span>
        </h1>

        <p className="verix-hero-subtitle">
          Built with recycled modern technology - high-performance AI
          designed with an eco-conscious future in mind.
        </p>

        <div className="verix-hero-actions">
          <button
            className="verix-btn-primary"
            onClick={handleGetStarted}
          >
            Start Building Faster &rarr;
          </button>

          <button
            className="verix-btn-secondary"
            onClick={handleGetStarted}
          >
            See How It Works
          </button>
        </div>
      </main>
    </div>
  );
}
