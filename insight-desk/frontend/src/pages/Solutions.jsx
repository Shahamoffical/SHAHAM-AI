import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import { useTheme } from "../context/ThemeContext";
import "./Solutions.css";

export default function Solutions() {
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
    <div className="verix-solutions-page">
      {/* Auth Modal Popup */}
      {showAuthModal && (
        <Login isModal={true} onClose={() => setShowAuthModal(false)} />
      )}

      {/* Ambient Background Glow */}
      <div className="verix-solutions-ambient" />

      {/* Header / Navbar */}
      <header className="verix-header">
        <div className="verix-brand" onClick={() => navigate("/")}>
          SHAHAM
        </div>

        <nav className="verix-nav-pills">
          <button
            className="verix-pill-item"
            onClick={() => navigate("/platform")}
          >
            Platform
          </button>
          <button
            className="verix-pill-item verix-pill-item--active"
            onClick={() => navigate("/solutions")}
          >
            Solutions
          </button>
          <button
            className="verix-pill-item"
            onClick={() => navigate("/ai-engine")}
          >
            AI Engine
          </button>
          <button className="verix-pill-item" onClick={handleGetStarted}>
            Research
          </button>
        </nav>

        <div className="verix-header-actions">
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

      {/* Main Content */}
      <main className="verix-solutions-content">
        <section className="verix-solutions-hero">
          <div className="verix-badge">ENTERPRISE & INDIVIDUAL SOLUTIONS</div>
          <h1 className="verix-solutions-title">
            INTELLIGENT KNOWLEDGE <span className="verix-orange-accent">SOLUTIONS</span>
          </h1>
          <p className="verix-solutions-subtitle">
            Transform unstructured web intelligence, internal PDFs, research archives, and custom data files into instantly actionable cited reports.
          </p>
        </section>

        {/* Solutions Grid */}
        <section className="verix-solutions-grid">
          <div className="verix-card">
            <div className="verix-card-tag">RESEARCH</div>
            <h3>Autonomous Literature Review</h3>
            <p>
              Scours live academic databases and web literature concurrently to produce cited executive summaries with Markdown reference links.
            </p>
          </div>

          <div className="verix-card">
            <div className="verix-card-tag">ENTERPRISE</div>
            <h3>PDF & CSV Knowledge Ingestion</h3>
            <p>
              Instantly index company annual reports, datasets, resumes, and specs for instant semantic vector search without manual tagging.
            </p>
          </div>

          <div className="verix-card">
            <div className="verix-card-tag">ANALYTICS</div>
            <h3>Competitive Market Intelligence</h3>
            <p>
              Deconstruct market trends, competitor updates, and industry moves into structured strategic briefings within seconds.
            </p>
          </div>

          <div className="verix-card">
            <div className="verix-card-tag">PERSONAL</div>
            <h3>Custom Profile & Portfolio RAG</h3>
            <p>
              Upload personal background documents or bios so SHAHAM AI can answer targeted questions about your skills and projects.
            </p>
          </div>
        </section>

        {/* Action CTA */}
        <section className="verix-solutions-cta">
          <h2>Start Exploring SHAHAM AI Solutions Today</h2>
          <button className="verix-btn-primary" onClick={handleGetStarted}>
            Open Research Workspace ➔
          </button>
        </section>
      </main>
    </div>
  );
}
