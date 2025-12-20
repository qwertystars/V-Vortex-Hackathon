import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";
import logo from "/logo.jpg";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshContext } = useAuth();
  const [name, setName] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventHubId, setEventHubId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const el = document.getElementById("onboarding-time");
    if (!el) return;

    const update = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString("en-GB", { hour12: false });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("name, university_name, phone, event_hub_id")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.name || "");
        setUniversityName(data.university_name || "");
        setPhone(data.phone || "");
        setEventHubId(data.event_hub_id || "");
      }
    };

    hydrate();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setSubmitting(true);

    const payload = {
      id: user.id,
      email: user.email,
      name: name.trim(),
      phone: phone.trim() || null,
      role: "team_member",
      university_name: universityName.trim(),
      event_hub_id: eventHubId.trim() || null,
      onboarding_complete: true,
    };

    const { error } = await supabase.from("users").upsert(payload, {
      onConflict: "id",
    });

    if (error) {
      console.error("Onboarding error:", error);
      alert("❌ Unable to save your profile. Please try again.");
      setSubmitting(false);
      return;
    }

    await refreshContext();
    navigate("/member");
  };

  return (
    <>
      <div className="marquee-bar">
        <div className="marquee-track">
          <span>⚡ MEMBER ONBOARDING • COMPLETE YOUR PROFILE •</span>
          <span aria-hidden="true">⚡ MEMBER ONBOARDING • COMPLETE YOUR PROFILE •</span>
        </div>
      </div>

      <div className="loginWrapper">
        <div className="terminalBox">
          <div className="terminalHeader">
            <div className="headerLeft">
              <img src={logo} className="headerLogo" alt="V-VORTEX logo" />
              <span className="title">V-VORTEX</span>
            </div>
            <div className="headerDots">
              <div className="dot d1"></div>
              <div className="dot d2"></div>
              <div className="dot d3"></div>
            </div>
          </div>

          <div className="sectionSubtitle">
            ⟨ MEMBER PROFILE ACTIVATION ⟩
          </div>

          <form onSubmit={handleSubmit}>
            <label className="fieldLabel">▸ MEMBER NAME</label>
            <input
              className="inputField"
              type="text"
              placeholder="Enter your warrior name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="helper">– Your identity in the roster</p>

            <label className="fieldLabel">▸ UNIVERSITY / COLLEGE</label>
            <input
              className="inputField"
              type="text"
              placeholder="Institute name"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              required
            />
            <p className="helper">– Used for official verification</p>

            <label className="fieldLabel">▸ CONTACT NUMBER (OPTIONAL)</label>
            <input
              className="inputField"
              type="tel"
              placeholder="+91 9XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label className="fieldLabel">▸ EVENTHUB ID (OPTIONAL)</label>
            <input
              className="inputField"
              type="text"
              placeholder="VIT EventHub Unique ID"
              value={eventHubId}
              onChange={(e) => setEventHubId(e.target.value)}
            />

            <button className="submitBtn" type="submit" disabled={submitting}>
              <span>{submitting ? "⚡ SYNCING..." : "⚡ CONFIRM & ENTER ARENA ⚡"}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="statusBar">
        <div className="statusItem">
          <div className="statusDot"></div>
          <span>PROFILE STATUS: PENDING</span>
        </div>
        <div className="statusItem">
          <span>SYSTEM TIME: <span id="onboarding-time"></span></span>
        </div>
        <div className="statusItem">
          <span>UPLOAD QUEUE: READY</span>
        </div>
      </div>
    </>
  );
}
