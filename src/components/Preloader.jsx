import { useRef, useState, useEffect } from "react";
import "../styles/preloader.css";

export default function Preloader({ onFinished }) {
  const [stage, setStage] = useState("tap");
  const videoRef = useRef(null);

  // Block all keyboard controls during the preloader video
  useEffect(() => {
    if (stage === "playing") {
      const blockKeyboard = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      window.addEventListener('keydown', blockKeyboard, true);
      window.addEventListener('keyup', blockKeyboard, true);
      window.addEventListener('keypress', blockKeyboard, true);
      
      return () => {
        window.removeEventListener('keydown', blockKeyboard, true);
        window.removeEventListener('keyup', blockKeyboard, true);
        window.removeEventListener('keypress', blockKeyboard, true);
      };
    }
  }, [stage]);

  const handleTap = () => {
    // Trigger glitch + zoom animations
    document.getElementById("enterScreen").classList.add("tapZoom");

    setTimeout(() => {
      setStage("playing");

      setTimeout(() => {
        const vid = videoRef.current;
        if (vid) {
          vid.muted = false;
          vid.volume = 1;
          vid.currentTime = 0;
          vid.play().then(() => {
            // Sound fade-in effect
            let vol = 0;
            const fade = setInterval(() => {
              if (vol >= 1) {
                clearInterval(fade);
              } else {
                vol += 0.05;
                vid.volume = vol;
              }
            }, 120);
          });
        }
      }, 300);
    }, 500);
  };

  const handleEnd = () => {
    document.getElementById("flash").classList.add("flashVisible");

    setTimeout(() => {
      const vid = videoRef.current;
      if (vid) vid.classList.add("videoFadeOut");
    }, 200);

    setTimeout(() => onFinished(), 1200);
  };

  return (
    <>
      {/* Scanline overlay */}
      <div className="scanlines"></div>

      {/* Flash transition */}
      <div id="flash"></div>

      {/* TAP SCREEN */}
      {stage === "tap" && (
        <div id="enterScreen" onClick={handleTap}>
          <div id="enterText">DARE TO ENTER THE VORTEX? .. CLICK HERE.. </div>
          <div id="arrow">▼</div>

          {/* Glitch overlay */}
          <div className="glitchLayer"></div>
        </div>
      )}

      {/* VIDEO */}
      {stage === "playing" && (
        <video
          id="introVideo"
          ref={videoRef}
          playsInline
          onEnded={handleEnd}
          onLoadedData={(e) => {
            setTimeout(() => {
              e.target.style.opacity = 1;
            }, 100);
          }}
          src="/secondpart_fixed.mp4"
        ></video>
      )}
    </>
  );
}
