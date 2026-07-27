import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Research from "./pages/Research";
import Platform from "./pages/Platform";
import Solutions from "./pages/Solutions";
import AIEngine from "./pages/AIEngine";

function Private({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/ai-engine" element={<AIEngine />} />
        <Route
          path="/research"
          element={
            <Private>
              <Research />
            </Private>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
