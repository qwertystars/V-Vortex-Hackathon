import "../styles/auth.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="authWrapper">
      <div className="authCard">
        <h1 className="authTitle">Login</h1>

        <input className="authInput" placeholder="Email" type="email" />
        <input className="authInput" placeholder="Password" type="password" />

        <button className="authBtn">Login</button>

        <div 
          className="altLink"
          onClick={() => navigate("/register")}
        >
          Don't have an account? Register
        </div>
      </div>
    </div>
  );
}
