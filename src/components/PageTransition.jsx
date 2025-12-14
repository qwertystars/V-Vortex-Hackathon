import { useEffect, useRef } from "react";
import "../styles/transition.css";

export default function PageTransition({ videoSrc, onFinished }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = false;
    v.currentTime = 0;

    const handleEnd = () => onFinished();
    v.addEventListener("ended", handleEnd);

    return () => {
      v.removeEventListener("ended", handleEnd);
    };
  }, [onFinished]);

  return (
    <div className="transitionOverlay">
      <video ref={videoRef} className="transitionVideo" playsInline>
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}

