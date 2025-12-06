import { useEffect, useRef } from "react";
import "../styles/transition.css"; // we will create this

export default function PageTransition({ videoSrc, onFinished }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = false;
      v.play();
      v.onended = () => onFinished();
    }
  }, []);

  return (
    <div className="transitionOverlay">
      <video ref={videoRef} className="transitionVideo" playsInline>
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}
