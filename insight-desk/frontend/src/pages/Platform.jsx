import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import { useTheme } from "../context/ThemeContext";
import "./Platform.css";

export default function Platform() {
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
    <div className="verix-platform-page">
      {/* Auth Modal Popup */}
      {showAuthModal && (
        <Login isModal={true} onClose={() => setShowAuthModal(false)} />
      )}

      {/* Ambient Background Glow */}
      <div className="verix-platform-ambient" />

      {/* Header / Navbar */}
      <header className="verix-header">
        <div className="verix-brand" onClick={() => navigate("/")}>
          SHAHAM
        </div>

        <nav className="verix-nav-pills">
          <button
            className="verix-pill-item verix-pill-item--active"
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
      <main className="verix-platform-content">
        <section className="verix-platform-hero">
          <div className="verix-badge">THE SHAHAM PLATFORM</div>
          <h1 className="verix-platform-title">
            AUTONOMOUS <span className="verix-orange-accent">RESEARCH PLATFORM</span>
          </h1>
          <p className="verix-platform-subtitle">
            Engineered for high-throughput, multi-agent AI execution, vector retrieval (RAG), and cited markdown synthesis — powered by local zero-latency intelligence.
          </p>
        </section>

        {/* Feature Grid */}
        <section className="verix-platform-grid">
          <div className="verix-card">
            <div className="verix-card-icon">⚡</div>
            <h3>Multi-Agent LangGraph Pipeline</h3>
            <p>
              Autonomous task decomposition using Planner, Parallel Researcher, and Writer Synthesizer agents running in synchronized workflow loops.
            </p>
          </div>

          <div className="verix-card">
            <div className="verix-card-icon">🧠</div>
            <h3>ChromaDB Vector Memory</h3>
            <p>
              Persistent vector embeddings store with 1600-character semantic chunking for instantaneous PDF, CSV, TXT, and Markdown document retrieval.
            </p>
          </div>

          <div className="verix-card">
            <div className="verix-card-icon">🔒</div>
            <h3>Self-Hosted & Private</h3>
            <p>
              Powered by Ollama Llama 3.2 local model inference. Zero external API leaks — your sensitive data never leaves your environment.
            </p>
          </div>

          <div className="verix-card">
            <div className="verix-card-icon">📊</div>
            <h3>Live Streaming WebSockets</h3>
            <p>
              Real-time activity logs streaming agent state, tool calls, and report updates directly to your interactive workspace.
            </p>
          </div>

          <div className="verix-card">
            <div className="verix-card-icon">🚀</div>
            <h3>Fast-Path Query Decisioning</h3>
            <p>
              Smart fast-path execution routing simple queries directly for sub-3-second responses while complex research scales dynamically.
            </p>
          </div>

          <div className="verix-card">
            <div className="verix-card-icon">🌐</div>
            <h3>Parallel Web & Document Search</h3>
            <p>
              Thread-pooled search workers query live web data and local vector stores concurrently for complete cited accuracy.
            </p>
          </div>
        </section>

        {/* Action CTA */}
        <section className="verix-platform-cta">
          <h2>Ready to Launch Your Autonomous AI Research?</h2>
          <button className="verix-btn-primary" onClick={handleGetStarted}>
            Launch Workspace ➔
          </button>
        </section>
      </main>
    </div>
  );
}
