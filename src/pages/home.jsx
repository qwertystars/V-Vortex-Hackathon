import React from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";  // <-- IMPORTANT

export default function Home({ setTransition }) {
  const navigate = useNavigate();

  // Navigation with transition video
  const goTo = (path) => {
    setTransition(
      <PageTransition
        videoSrc="/transition.mp4"
        onFinished={() => {
          setTransition(null);
          navigate(path);
        }}
      />
    );
  };

  return (
    <div className="homeWrapper">
      
      {/* TOP NAVIGATION PANEL */}
      <nav className="topNav">
        <div className="navLeft">
          <img src="/logo.jpg" alt="Logo" className="navLogo" />
          <span className="brandName">VORTEX SYSTEM</span>
        </div>

        <div className="navRight">
          <button 
            className="navBtn"
            onClick={() => goTo("/login")}   // <-- transition added
          >
            Login
          </button>

          <button 
            className="navBtn secondary"
            onClick={() => goTo("/register")} // <-- transition added
          >
            Register
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <section className="aboutSection">
        <h1 className="aboutTitle">About Us</h1>
        
        <p className="aboutText">
          Welcome to <span className="accent">VORTEX</span> — a next-generation
          cyber intelligence and hackathon evaluation platform.  
          <br /><br />
          Our system blends futuristic UI/UX with real-time analysis tools,
          enabling teams and evaluators to collaborate efficiently and securely.  
          <br /><br />
          Designed for modern developers, innovators, and creators, VORTEX
          provides an immersive experience powered by a cinematic digital
          environment.
        </p>
      </section>

    </div>
  );
}
