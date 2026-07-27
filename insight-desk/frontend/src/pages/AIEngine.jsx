import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import { useTheme } from "../context/ThemeContext";
import "./AIEngine.css";

export default function AIEngine() {
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
    <div className="verix-engine-page">
      {/* Auth Modal Popup */}
      {showAuthModal && (
        <Login isModal={true} onClose={() => setShowAuthModal(false)} />
      )}

      {/* Ambient Background Glow */}
      <div className="verix-engine-ambient" />

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
            className="verix-pill-item"
            onClick={() => navigate("/solutions")}
          >
            Solutions
          </button>
          <button
            className="verix-pill-item verix-pill-item--active"
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
      <main className="verix-engine-content">
        <section className="verix-engine-hero">
          <div className="verix-badge">COGNITIVE ARCHITECTURE</div>
          <h1 className="verix-engine-title">
            THE SHAHAM <span className="verix-orange-accent">AI COGNITIVE ENGINE</span>
          </h1>
          <p className="verix-engine-subtitle">
            A state-of-the-art multi-agent framework orchestrating intent planning, parallel retrieval, and contextual synthesis.
          </p>
        </section>

        {/* Engine Pipeline Visual Diagram */}
        <section className="verix-engine-pipeline">
          <div className="verix-pipeline-step">
            <div className="verix-step-num">01</div>
            <h4>Planner Agent</h4>
            <p>Deconstructs user query into 1-2 focused subtasks and decides optimal search targets.</p>
          </div>
          <div className="verix-pipeline-arrow">➔</div>

          <div className="verix-pipeline-step">
            <div className="verix-step-num">02</div>
            <h4>Parallel Researcher</h4>
            <p>Executes web search & ChromaDB vector RAG retrieval concurrently across worker threads.</p>
          </div>
          <div className="verix-pipeline-arrow">➔</div>

          <div className="verix-pipeline-step">
            <div className="verix-step-num">03</div>
            <h4>Writer Synthesizer</h4>
            <p>Assembles top findings and generates a cited Markdown research report with inline links.</p>
          </div>
        </section>

        {/* Engine Tech Specs */}
        <section className="verix-engine-specs">
          <div className="verix-spec-box">
            <h3>⚡ Sub-3s Latency</h3>
            <p>Fast-path execution handles short queries in 1-3 seconds with zero unnecessary delay.</p>
          </div>
          <div className="verix-spec-box">
            <h3>📦 1600 Chunking</h3>
            <p>Recursive text splitting with 150 overlap keeps paragraph semantic context intact.</p>
          </div>
          <div className="verix-spec-box">
            <h3>🦙 Ollama Llama 3.2</h3>
            <p>Runs 100% locally with high-performance prompt formatting and zero external dependencies.</p>
          </div>
        </section>

        {/* Action CTA */}
        <section className="verix-engine-cta">
          <h2>Test the Engine in Action</h2>
          <button className="verix-btn-primary" onClick={handleGetStarted}>
            Launch AI Research ➔
          </button>
        </section>
      </main>
    </div>
  );
}
