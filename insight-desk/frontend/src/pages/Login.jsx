import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Login.css";

export default function Login({ isModal, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let token;
      if (isRegister) {
        const res = await api.post("/auth/register", { email: email.trim(), password });
        token = res.data.access_token;
      } else {
        const form = new URLSearchParams();
        form.append("username", email.trim());
        form.append("password", password);
        const res = await api.post("/auth/login", form);
        token = res.data.access_token;
      }
      localStorage.setItem("token", token);
      localStorage.setItem("user_email", email.trim());
      if (onClose) onClose();
      navigate("/research");
    } catch (e) {
      const errDetail = e.response?.data?.detail;
      if (Array.isArray(errDetail)) {
        setError("Please enter a valid email address and password.");
      } else if (typeof errDetail === "string") {
        setError(errDetail);
      } else {
        setError("Unable to complete request. Please verify your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={`hexta-auth-container ${isModal ? "hexta-auth-container--modal" : ""}`}>
      {/* Close button for modal */}
      {isModal && (
        <button className="hexta-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
      )}

      {/* Left Column: Heading + 3D Cyborg Image */}
      <div className="hexta-auth-left">
        <h1 className="hexta-auth-headline">
          CONVERT YOUR IDEAS<br />
          INTO SUCCESSFUL<br />
          BUSINESS.
        </h1>

        <div className="hexta-cyborg-wrap">
          <img
            src="/auth_robot_bust.png"
            alt="Futuristic AI Mannequin Bust"
            className="hexta-cyborg-img"
          />
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="hexta-auth-right">
        <div className="hexta-form-box">
          {/* Orange Logo Icon */}
          <div className="hexta-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>

          <h2 className="hexta-form-title">
            {isRegister ? "Get Started" : "Welcome Back"}
          </h2>
          <p className="hexta-form-subtitle">
            Welcome to Insight Desk - Let's get started
          </p>

          <form onSubmit={submit} className="hexta-form">
            {/* Email Field */}
            <div className="hexta-field">
              <label className="hexta-label">Your Email</label>
              <input
                className="hexta-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="hexta-field">
              <label className="hexta-label">Password</label>
              <div className="hexta-password-wrap">
                <input
                  className="hexta-input hexta-input--password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ds1s23@#12ds"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  className="hexta-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="hexta-checkbox-wrap">
              <label className="hexta-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hexta-checkbox-input"
                />
                <span className="hexta-checkbox-custom" />
                <span>Remember me</span>
              </label>
            </div>

            {/* Error Message */}
            {error && <div className="hexta-error-msg">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="hexta-btn-orange"
              disabled={loading}
            >
              {loading
                ? (isRegister ? "Creating Account..." : "Signing In...")
                : (isRegister ? "Get Started" : "Sign in")
              }
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="hexta-footer-toggle">
            <span>
              {isRegister ? "Already have an account? " : "Don't have an account? "}
            </span>
            <button
              type="button"
              className="hexta-toggle-link"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister ? "Sign in" : "Get Started"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="hexta-modal-backdrop" onClick={onClose}>
        <div className="hexta-modal-wrapper" onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
      </div>
    );
  }

  return <div className="hexta-page">{content}</div>;
}
