import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api, { WS_URL } from "../api";
import { useTheme } from "../context/ThemeContext";
import "./Research.css";

export default function Research() {
  const [query, setQuery] = useState("");
  const [sessionId] = useState(() => "s_" + Date.now());
  const [activities, setActivities] = useState([]);
  const [report, setReport] = useState("");
  const [running, setRunning] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [history, setHistory] = useState([]);
  const [viewingReport, setViewingReport] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [modelMode, setModelMode] = useState("Pro");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const recognitionRef = useRef(null);
  const baseQueryRef = useRef("");
  const wsRef = useRef(null);
  const activityEndRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Load user email on mount
  useEffect(() => {
    const saved = localStorage.getItem("user_email");
    if (saved) {
      setUserEmail(saved);
    } else {
      setUserEmail("Shaham Abbas");
    }
  }, []);

  // Initialize Web Speech API for Voice Typing
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          interim += event.results[i][0].transcript;
        }
        setQuery(baseQueryRef.current + interim);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceTyping = () => {
    if (!recognitionRef.current) {
      alert("Voice typing is not supported by your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      baseQueryRef.current = query ? query.trim() + " " : "";
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Auto-scroll activity panel
  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activities]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/sessions");
      setHistory(res.data);
    } catch {
      // ignore
    }
  };

  const viewSession = async (id) => {
    try {
      const res = await api.get(`/sessions/${id}`);
      setViewingReport(res.data);
      setReport(res.data.report);
      setActivities([]);
    } catch {
      // ignore
    }
  };

  const handleNewResearch = () => {
    setQuery("");
    setReport("");
    setActivities([]);
    setViewingReport(null);
    setUploadMsg("");
  };

  // PDF/CSV upload
  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploadMsg("Uploading & indexing...");
    setUploadStatus("");
    try {
      const res = await api.post(`/upload?session_id=${sessionId}`, fd);
      if (res.data.error) {
        setUploadMsg(res.data.error);
        setUploadStatus("error");
      } else {
        setUploadMsg(`✓ ${res.data.filename} — ${res.data.message}`);
        setUploadStatus("success");
      }
    } catch {
      setUploadMsg("Upload failed");
      setUploadStatus("error");
    }
  };

  // Research start via WebSocket
  const startResearch = () => {
    const currentQuery = query.trim();
    if (!currentQuery) return;
    setQuery("");
    setActivities([]);
    setReport("");
    setViewingReport(null);
    setRunning(true);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          token: localStorage.getItem("token"),
          query: currentQuery,
          session_id: sessionId,
        })
      );
    };

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.type === "activity") {
        setActivities((prev) => [
          ...prev,
          { agent: data.agent, message: data.message },
        ]);
      } else if (data.type === "report") {
        setReport(data.report);
      } else if (data.type === "done") {
        setRunning(false);
        ws.close();
        loadHistory();
      } else if (data.type === "error") {
        setActivities((prev) => [
          ...prev,
          { agent: "System", message: "Error: " + data.message },
        ]);
        setRunning(false);
        ws.close();
      }
    };

    ws.onerror = () => setRunning(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !running) {
      e.preventDefault();
      startResearch();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  const agentClass = (agent) => {
    const map = {
      Planner: "planner",
      Research: "research",
      Writer: "writer",
      System: "system",
    };
    return map[agent] || "system";
  };

  // User display name & avatar initial
  const displayName = userEmail.includes("@") ? userEmail.split("@")[0] : userEmail;
  const avatarInitial = displayName.charAt(0).toUpperCase() || "S";

  return (
    <div className={`shaham-layout ${sidebarOpen ? "shaham-sidebar-expanded" : "shaham-sidebar-collapsed"}`}>
      {/* Background Ambient Glow */}
      <div className="verix-research-ambient" />

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="shaham-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR (Search History & User Profile) ===== */}
      <aside className="shaham-sidebar">
        {/* Top: Brand & New Research Button */}
        <div className="shaham-sidebar-header">
          <button
            type="button"
            className="shaham-new-chat-btn"
            onClick={handleNewResearch}
            title="Start New Research Chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>New chat</span>
          </button>
        </div>

        {/* Middle: Scrollable Search History */}
        <div className="shaham-sidebar-body">
          <div className="shaham-history-group-title">30 Days</div>
          <div className="shaham-history-list">
            {history.length === 0 ? (
              <div className="shaham-history-empty">No research history yet</div>
            ) : (
              history.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  className={`shaham-history-item ${viewingReport?.id === s.id ? "shaham-history-item--active" : ""}`}
                  onClick={() => viewSession(s.id)}
                  title={s.query}
                >
                  <span className="shaham-history-text">{s.query}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Bottom: User Account Profile Card */}
        <div className="shaham-sidebar-footer">
          <div className="shaham-user-card">
            <div className="shaham-user-avatar">{avatarInitial}</div>
            <div className="shaham-user-info">
              <div className="shaham-user-name">{displayName}</div>
              <div className="shaham-user-email">{userEmail}</div>
            </div>
            <button
              type="button"
              className="shaham-user-logout-btn"
              onClick={logout}
              title="Logout"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="shaham-main-wrapper">
        {/* TOP NAVBAR */}
        <header className="verix-research-nav">
          <div className="verix-research-nav-left">
            {/* Sidebar Toggle Hamburger */}
            <button
              type="button"
              className="shaham-sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>

            <div className="verix-research-brand" onClick={() => navigate("/")}>
              SHAHAM <span className="verix-nav-tag">AI RESEARCH</span>
            </div>
          </div>

          <nav className="verix-research-pills">
            <button className="verix-research-pill" onClick={() => navigate("/platform")}>
              Platform
            </button>
            <button className="verix-research-pill" onClick={() => navigate("/solutions")}>
              Solutions
            </button>
            <button className="verix-research-pill" onClick={() => navigate("/ai-engine")}>
              AI Engine
            </button>
            <button className="verix-research-pill verix-research-pill--active" onClick={loadHistory}>
              Research Workspace
            </button>
          </nav>

          <div className="verix-research-user-actions">
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

            <button className="verix-research-btn-logout" onClick={logout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* MAIN WORKSPACE BODY — 100vh locked, no page scroll */}
        <main className="verix-research-main">

          {/* ===== SCROLLABLE RESPONSE AREA (above search bar) ===== */}
          <div className="shaham-response-area">
            {/* Hero Title — shown when no results */}
            {!report && activities.length === 0 && (
              <div className="verix-research-hero">
                <h1 className="verix-research-title">
                  HELLO <span className="verix-orange-accent">{displayName ? displayName.toUpperCase() : "RESEARCHER"}</span>
                </h1>
                <p className="verix-research-subtitle">
                  Enter your question — our multi-agent AI engine will plan, execute search & document retrieval, and write a cited report for you.
                </p>
              </div>
            )}

            {/* Live Agent Activity Panel */}
            {activities.length > 0 && (
              <div className="verix-panel verix-activity-panel">
                <div className="verix-panel-header">
                  <span
                    className={`verix-activity-dot ${
                      running ? "verix-activity-dot--running" : ""
                    }`}
                  />
                  <span className="verix-panel-title">LIVE MULTI-AGENT ACTIVITY</span>
                </div>
                <div className="verix-activity-body">
                  {activities.map((a, i) => (
                    <div className="verix-activity-row" key={i}>
                      <span
                        className={`verix-agent-tag verix-agent-tag--${agentClass(
                          a.agent
                        )}`}
                      >
                        {a.agent}
                      </span>
                      <span className="verix-activity-msg">{a.message}</span>
                    </div>
                  ))}
                  <div ref={activityEndRef} />
                </div>
              </div>
            )}

            {/* Generated Research Report Panel */}
            {report && (
              <div className="verix-panel verix-report-panel">
                <div className="verix-panel-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                  </svg>
                  <span className="verix-panel-title">
                    {viewingReport ? "SAVED REPORT" : "SYNTHESIZED RESEARCH REPORT"}
                  </span>
                </div>
                <div className="verix-report-markdown">
                  <ReactMarkdown>{report}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* ===== SEARCH BAR — pinned at bottom ===== */}
          <div className="shaham-search-bottom">
            <div className="gemini-stadium-card">
              {/* Top Textarea */}
              <textarea
                className="gemini-textarea"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your research question..."
                disabled={running}
              />

              {/* Bottom Bar inside Stadium Container */}
              <div className="gemini-bottom-bar">
                {/* Left Controls: Plus + Documents attachment button */}
                <div className="gemini-left-actions">
                  <label className="gemini-icon-btn" title="Upload PDF or CSV Document">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <input
                      type="file"
                      accept=".pdf,.csv,.txt,.md"
                      onChange={upload}
                      className="gemini-file-input"
                    />
                  </label>

                  <label className="gemini-pill-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>Documents</span>
                    <input
                      type="file"
                      accept=".pdf,.csv,.txt,.md"
                      onChange={upload}
                      className="gemini-file-input"
                    />
                  </label>

                  {uploadMsg && (
                    <span
                      className={`gemini-upload-status ${
                        uploadStatus === "success"
                          ? "gemini-upload-status--success"
                          : uploadStatus === "error"
                          ? "gemini-upload-status--error"
                          : ""
                      }`}
                    >
                      {uploadMsg}
                    </span>
                  )}
                </div>

                {/* Right Controls: Pro Selector, Microphone, Submit */}
                <div className="gemini-right-actions">
                  {/* Pro Dropdown Selector */}
                  <button
                    type="button"
                    className="gemini-pro-pill"
                    onClick={() => setModelMode(modelMode === "Pro" ? "Ultra" : "Pro")}
                    title="Model Mode"
                  >
                    <span>{modelMode}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Voice Typing Microphone */}
                  <button
                    type="button"
                    className={`gemini-mic-btn ${isListening ? "gemini-mic-btn--active" : ""}`}
                    onClick={toggleVoiceTyping}
                    disabled={running}
                    title={isListening ? "Stop Voice Typing" : "Voice Typing"}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                  </button>

                  {/* Submit Arrow Button */}
                  <button
                    type="button"
                    className="gemini-send-btn"
                    onClick={startResearch}
                    disabled={running || !query.trim()}
                    title="Start Research"
                  >
                    {running ? (
                      <span className="gemini-spinner" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
