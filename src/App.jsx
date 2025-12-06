import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Preloader from "./components/Preloader";
import PageTransition from "./components/PageTransition";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";

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
        </Routes>
      )}

    </BrowserRouter>
  );
}
