import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Preloader from "./components/Preloader";
import { ToastProvider } from "./components/ui/CyberpunkToast";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import "./styles/dashboard.css";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import OTP from "./pages/otp";
import TeamDashboard from "./pages/dashboard";
import Member from "./pages/member";

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [transition, setTransition] = useState(null);

  return (
    <BrowserRouter>
      <ToastProvider>
        {transition}

        {!introDone ? (
          <Preloader onFinished={() => setIntroDone(true)} />
        ) : (
          <RouteErrorBoundary>
            <Routes>
              <Route path="/" element={<Home setTransition={setTransition} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register setTransition={setTransition} />} />
              <Route path="/otp" element={<OTP setTransition={setTransition} />} />
              <Route path="/member" element={<Member />} />
              <Route path="/dashboard" element={<TeamDashboard />} />
              <Route path="/dashboard/:teamId" element={<TeamDashboard />} />
            </Routes>
          </RouteErrorBoundary>
        )}
      </ToastProvider>
    </BrowserRouter>
  );
}
