import "../styles/auth.css";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="authWrapper">
      <div className="authCard">
        <h1 className="authTitle">Register</h1>

        <input className="authInput" placeholder="Full Name" type="text" />
        <input className="authInput" placeholder="Email" type="email" />
        <input className="authInput" placeholder="Password" type="password" />

        <button className="authBtn">Create Account</button>

        <div 
          className="altLink"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </div>
      </div>
    </div>
  );
}
