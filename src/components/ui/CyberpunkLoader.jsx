import React from "react";
import "./CyberpunkLoader.css";

/**
 * CyberpunkLoader - Reusable loading component with cyberpunk aesthetic
 *
 * @param {Object} props
 * @param {string} props.message - Loading message to display
 * @param {'spinner' | 'dots' | 'progress' | 'pulse'} props.type - Type of loading animation
 * @param {number} props.progress - Progress percentage (0-100) for progress type
 * @param {boolean} props.fullscreen - Whether to show as fullscreen overlay
 * @param {boolean} props.inline - Whether to show inline (smaller version)
 * @param {string} props.size - Size variant: 'small', 'medium', 'large'
 */
const CyberpunkLoader = ({
  message = "INITIALIZING...",
  type = "spinner",
  progress = 0,
  fullscreen = false,
  inline = false,
  size = "medium"
}) => {
  const loaderClass = `
    cyberpunk-loader
    ${fullscreen ? 'fullscreen' : ''}
    ${inline ? 'inline' : ''}
    size-${size}
  `;

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="loader-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        );

      case 'progress':
        return (
          <div className="loader-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              >
                <span className="progress-glow"></span>
              </div>
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
        );

      case 'pulse':
        return (
          <div className="loader-pulse">
            <div className="pulse-ring"></div>
            <div className="pulse-core"></div>
          </div>
        );

      case 'spinner':
      default:
        return (
          <div className="loader-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-core"></div>
          </div>
        );
    }
  };

  return (
    <div className={loaderClass}>
      <div className="loader-content">
        {renderLoader()}
        {message && (
          <div className="loader-message">
            <span className="message-text">{message}</span>
            <div className="message-glitch"></div>
          </div>
        )}
      </div>

      {fullscreen && (
        <div className="scanlines">
          <div className="scanline"></div>
        </div>
      )}
    </div>
  );
};

export default CyberpunkLoader;