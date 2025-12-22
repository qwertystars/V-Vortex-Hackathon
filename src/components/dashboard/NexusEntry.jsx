import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../supabaseClient";

const CHECKPOINT = "entry_1";

const formatTimestamp = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString();
};

const formatCountdown = (ms) => {
  if (!Number.isFinite(ms) || ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export default function NexusEntry({ team }) {
  const [token, setToken] = useState(null);
  const [tokenMeta, setTokenMeta] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const status = useMemo(() => {
    if (!tokenMeta) {
      return { label: "No token", tone: "idle" };
    }

    if (tokenMeta.used_at) {
      return { label: "Used", tone: "used" };
    }

    const expiresAt = new Date(tokenMeta.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      return { label: "Expired", tone: "expired" };
    }

    return { label: "Active", tone: "active" };
  }, [tokenMeta]);

  const refreshTokenMeta = async () => {
    if (!team?.id) return;
    setRefreshing(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("qr_tokens")
      .select("id, issued_at, expires_at, used_at, checkpoint")
      .eq("team_id", team.id)
      .eq("checkpoint", CHECKPOINT)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("QR token fetch error:", fetchError);
      setError("Unable to load the latest token status.");
    } else {
      setTokenMeta(data || null);
    }

    setRefreshing(false);
  };

  const mintToken = async () => {
    if (!team?.id) return;
    setLoading(true);
    setError("");

    const { data, error: mintError } = await supabase.functions.invoke(
      "mint-qr-token",
      {
        body: { checkpoint: CHECKPOINT },
      }
    );

    if (mintError) {
      console.error("Mint QR token error:", mintError);
      setError(mintError.message || "Unable to mint a QR token.");
      setLoading(false);
      return;
    }

    setToken(data?.raw_token || null);
    setTokenMeta({
      issued_at: new Date().toISOString(),
      expires_at: data?.expires_at,
      used_at: null,
      checkpoint: data?.checkpoint,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (!team?.id) return;
    refreshTokenMeta();
  }, [team?.id]);

  useEffect(() => {
    if (!tokenMeta?.expires_at || tokenMeta?.used_at) {
      setCountdown("");
      return;
    }

    const update = () => {
      const remaining = new Date(tokenMeta.expires_at).getTime() - Date.now();
      setCountdown(formatCountdown(remaining));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [tokenMeta?.expires_at, tokenMeta?.used_at]);

  return (
    <div className="nexusWrapper">
      <div className="nexusCard">
        <div className="nexusQrColumn">
          <div className={`qrBox ${status.tone}`}>
            {token ? (
              <QRCodeSVG value={token} size={150} bgColor="#ffffff" fgColor="#111827" />
            ) : (
              <div className="lockIcon">🔒</div>
            )}
            {status.tone !== "active" && token && (
              <div className="qrOverlay">
                <span>{status.label.toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="nexusCheckpoint">Checkpoint 1 · Nexus Entry</div>
          <div className="nexusStatusBadge" data-tone={status.tone}>
            {status.label}
          </div>
        </div>

        <div className="nexusBody">
          <div>
            <div className="nexusTitle">SQUAD: {team?.team_name || "—"}</div>
            <p className="nexusDesc">
              Generate a short-lived entry key for checkpoint verification. Keep
              this screen open until your team is scanned. The token is shown
              only once per mint.
            </p>
          </div>

          <div className="nexusMeta">
            <div className="nexusMetaRow">
              <span>Expires</span>
              <strong>
                {tokenMeta?.expires_at
                  ? `${formatTimestamp(tokenMeta.expires_at)}`
                  : "—"}
              </strong>
            </div>
            <div className="nexusMetaRow">
              <span>Countdown</span>
              <strong>{countdown || "—"}</strong>
            </div>
            <div className="nexusMetaRow">
              <span>Used at</span>
              <strong>{formatTimestamp(tokenMeta?.used_at)}</strong>
            </div>
          </div>

          {error && <p className="helper error">{error}</p>}

          <div className="nexusActions">
            <button
              className="verifyBtn"
              type="button"
              onClick={mintToken}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Entry QR (Checkpoint 1)"}
            </button>
            <button
              className="verifyBtn ghost"
              type="button"
              onClick={refreshTokenMeta}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh Status"}
            </button>
          </div>

          <div className="nexusHint">
            QR tokens are single-use and expire automatically. Only share this
            with authorized staff.
          </div>
        </div>
      </div>
    </div>
  );
}
