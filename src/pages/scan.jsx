import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/scan.css";

const formatCheckpoint = (value) => {
  if (!value) return "—";
  if (value === "entry_1") return "Checkpoint 1";
  if (value === "entry_2") return "Checkpoint 2";
  if (value === "entry_3") return "Checkpoint 3";
  return value;
};

const formatTimestamp = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString();
};

export default function Scan() {
  const [rawToken, setRawToken] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    const trimmedToken = rawToken.trim();
    const trimmedPin = pin.trim();

    if (!trimmedToken) {
      setError("Paste the QR token to verify.");
      return;
    }
    if (!trimmedPin) {
      setError("Enter the organizer PIN to continue.");
      return;
    }

    setLoading(true);

    const { data, error: verifyError } = await supabase.functions.invoke(
      "verify-qr-token",
      {
        body: { raw_token: trimmedToken },
        headers: { "x-scan-secret": trimmedPin },
      }
    );

    if (verifyError) {
      console.error("Verify QR token error:", verifyError);
      const message =
        verifyError?.context?.error ||
        verifyError?.message ||
        "Unable to verify this token.";
      setError(message);
      setLoading(false);
      return;
    }

    if (!data?.ok) {
      setError(data?.error || "Verification failed.");
      setLoading(false);
      return;
    }

    setResult({
      teamName: data.team_name || "Unknown team",
      checkpoint: formatCheckpoint(data.checkpoint),
      checkedInAt: formatTimestamp(data.checked_in_at),
      alreadyCheckedIn: Boolean(data.already_checked_in),
    });
    setLoading(false);
  };

  return (
    <div className="scanShell">
      <div className="scanPanel">
        <div className="scanFormPane">
          <div className="scanHeader">
            <div className="scanTitle">Nexus Entry Scanner</div>
            <p className="scanSubtitle">
              Paste the QR payload and authenticate with the organizer PIN to
              record attendance.
            </p>
          </div>

          <form className="scanForm" onSubmit={handleVerify}>
            <label className="scanLabel" htmlFor="scan-token">
              QR token payload
            </label>
            <textarea
              id="scan-token"
              className="scanInput scanTextarea"
              rows={4}
              value={rawToken}
              onChange={(event) => {
                setRawToken(event.target.value);
                if (error) setError("");
              }}
              placeholder="Paste raw token from QR scan"
            />

            <label className="scanLabel" htmlFor="scan-pin">
              Organizer PIN
            </label>
            <input
              id="scan-pin"
              className="scanInput"
              type="password"
              value={pin}
              onChange={(event) => {
                setPin(event.target.value);
                if (error) setError("");
              }}
              placeholder="Enter shared PIN"
            />

            {error && <div className="scanAlert error">{error}</div>}

            <button className="scanButton" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Check In"}
            </button>
          </form>
        </div>

        <div className="scanStatusPane">
          <div className="scanStatusCard">
            <div className="scanStatusTitle">Latest Result</div>

            {!result && !error && (
              <div className="scanStatusEmpty">
                Awaiting scan input. Results will appear here.
              </div>
            )}

            {result && (
              <div
                className="scanResult"
                data-tone={result.alreadyCheckedIn ? "warn" : "success"}
              >
                <div className="scanResultHeadline">
                  {result.alreadyCheckedIn
                    ? "Already Checked In"
                    : "Check-in Confirmed"}
                </div>
                <div className="scanResultRow">
                  <span>Team</span>
                  <strong>{result.teamName}</strong>
                </div>
                <div className="scanResultRow">
                  <span>Checkpoint</span>
                  <strong>{result.checkpoint}</strong>
                </div>
                <div className="scanResultRow">
                  <span>Time</span>
                  <strong>{result.checkedInAt}</strong>
                </div>
              </div>
            )}

            {error && !result && (
              <div className="scanResult" data-tone="error">
                <div className="scanResultHeadline">Verification Failed</div>
                <div className="scanResultRow">
                  <span>Details</span>
                  <strong>{error}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="scanFootnote">
            Tokens expire automatically and are single-use. Use the organizer PIN
            to unlock verification.
          </div>
        </div>
      </div>
    </div>
  );
}
