import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Preloader from "./components/Preloader";
import "./styles/dashboard.css";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import OTP from "./pages/otp";
import TeamDashboard from "./pages/dashboard";
import Member from "./pages/member";
import Scan from "./pages/scan";

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [transition, setTransition] = useState(null);

  return (
    <BrowserRouter>

      {transition}

      {!introDone ? (
        <Preloader onFinished={() => setIntroDone(true)} />
      ) : (
        <Routes>
          <Route path="/" element={<Home setTransition={setTransition} />} />
          <Route path="/login" element={<Login setTransition={setTransition} />} />
          <Route path="/register" element={<Register setTransition={setTransition} />} />
          <Route path="/otp" element={<OTP setTransition={setTransition} />} />
          <Route
            path="/member"
            element={
              <ProtectedRoute requireRole="team_member" requireTeam>
                <Member />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireRole="team_leader" requireTeam>
                <TeamDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:teamId"
            element={
              <ProtectedRoute requireRole="team_leader" requireTeam>
                <TeamDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <Scan />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}

    </BrowserRouter>
  );
}
