import React, { useState, useRef, useEffect } from 'react';
import './QRCodeDisplay.css';

/**
 * QR Code Display Component
 * Generates and displays QR codes for team members
 */
const QRCodeDisplay = ({
  qrData,
  memberName,
  teamName,
  size = 200,
  showDownload = true,
  showRegenerate = true,
  onRegenerate,
  loading = false
}) => {
  const [qrGenerated, setQrGenerated] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (qrData) {
      generateQRCode(qrData);
    }
  }, [qrData]);

  /**
   * Generate QR code using canvas
   */
  const generateQRCode = async (data) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const qrSize = size;

    // Clear canvas
    canvas.width = qrSize;
    canvas.height = qrSize;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, qrSize, qrSize);

    // For now, create a placeholder pattern
    // In a real implementation, you'd use a QR code library like qrcode.js
    const cellSize = 8;
    const modules = 25;
    const padding = (qrSize - (modules * cellSize)) / 2;

    // Generate simple pattern (placeholder)
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const isDark = Math.random() > 0.5;

        // Add position markers (corners)
        const isCorner = (
          (row < 7 && col < 7) || // Top-left
          (row < 7 && col >= modules - 7) || // Top-right
          (row >= modules - 7 && col < 7) // Bottom-left
        );

        if (isCorner || isDark) {
          ctx.fillStyle = isCorner ? '#00e6ff' : '#ffffff';
          ctx.fillRect(
            padding + col * cellSize,
            padding + row * cellSize,
            cellSize - 1,
            cellSize - 1
          );
        }
      }
    }

    // Add member info at bottom
    ctx.fillStyle = '#00e6ff';
    ctx.font = '10px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(memberName || 'MEMBER', qrSize / 2, qrSize - 20);

    setQrGenerated(true);
  };

  /**
   * Download QR code as image
   */
  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `${teamName || 'member'}-${memberName || 'qr'}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  /**
   * Copy QR code to clipboard
   */
  const copyToClipboard = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise(resolve => {
        canvasRef.current.toBlob(resolve);
      });

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      // Show success feedback
      const button = document.querySelector('[data-copy-action]');
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy QR code:', err);
    }
  };

  return (
    <div className="qr-code-display">
      <div className="qr-container">
        {loading ? (
          <div className="qr-loading">
            <div className="qr-spinner"></div>
            <p>Generating QR Code...</p>
          </div>
        ) : qrGenerated ? (
          <>
            <div className="qr-wrapper">
              <canvas
                ref={canvasRef}
                className="qr-canvas"
                style={{ width: size, height: size }}
              />

              {/* Cyberpunk frame effect */}
              <div className="qr-frame">
                <div className="frame-corner top-left"></div>
                <div className="frame-corner top-right"></div>
                <div className="frame-corner bottom-left"></div>
                <div className="frame-corner bottom-right"></div>
              </div>
            </div>

            {/* QR Code info */}
            <div className="qr-info">
              <div className="qr-details">
                <h3>ACCESS CREDENTIAL</h3>
                <p className="member-name">{memberName || 'Team Member'}</p>
                <p className="team-name">{teamName || 'Team Name'}</p>
                {qrData && (
                  <p className="qr-timestamp">
                    Generated: {new Date().toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="qr-actions">
              {showDownload && (
                <button
                  className="qr-btn primary"
                  onClick={downloadQRCode}
                  title="Download QR Code"
                >
                  <span className="btn-icon">📥</span>
                  Export
                </button>
              )}

              <button
                className="qr-btn secondary"
                onClick={copyToClipboard}
                data-copy-action
                title="Copy to Clipboard"
              >
                <span className="btn-icon">📋</span>
                Copy
              </button>

              {showRegenerate && onRegenerate && (
                <button
                  className="qr-btn secondary"
                  onClick={onRegenerate}
                  title="Regenerate QR Code"
                >
                  <span className="btn-icon">🔄</span>
                  Regenerate
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="qr-empty">
            <div className="qr-placeholder">
              <span className="qr-icon">📱</span>
              <p>No QR Code Generated</p>
              {showRegenerate && onRegenerate && (
                <button
                  className="qr-btn primary"
                  onClick={onRegenerate}
                >
                  Generate QR Code
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="qr-instructions">
        <h4>SCAN INSTRUCTIONS</h4>
        <ul>
          <li>Present this QR code at registration checkpoints</li>
          <li>Ensure the QR code is clearly visible</li>
          <li>Keep this code secure - it's your access credential</li>
          <li>Regenerate if code becomes damaged or unreadable</li>
        </ul>
      </div>
    </div>
  );
};

export default QRCodeDisplay;