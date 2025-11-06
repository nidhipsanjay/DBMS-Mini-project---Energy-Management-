import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", { email });
      const user = res.data.user;

      if (res.data.success && user) {
        localStorage.setItem("auth", "true");
        localStorage.setItem("role", user.role);
        localStorage.setItem("user", user.name); // save only the name

        alert(`Welcome ${user.name || user.email} (${user.role})`);
        navigate("/", { replace: true });
        window.location.reload();
      } else {
        alert("Invalid login response");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="vh-100 d-flex justify-content-end align-items-center"
      style={{
        background: "transparent", // background image is visible here
        paddingRight: "5vw",
      }}
    >
      <div
        className="login-panel shadow-lg p-4"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "20px",
          backdropFilter: "blur(12px)",
          background: "rgba(255, 255, 255, 0.15)", // frosted glass
          border: "1px solid rgba(255, 255, 255, 0.3)",
          color: "white",
        }}
      >
        <h3
          className="text-center mb-4"
          style={{
            fontWeight: "600",
            color: "#fff",
          }}
        >
          🔐 Welcome Back
        </h3>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold text-white">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                borderRadius: "10px",
                padding: "10px",
                borderColor: "#ced4da",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 text-white fw-semibold"
            style={{
              background: "linear-gradient(135deg, #2b8cff 0%, #6a1b9a 100%)",
              borderRadius: "10px",
              padding: "10px",
              border: "none",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4 mb-0" style={{ color: "#eaeaea" }}>
          Use your registered email to sign in
        </p>
      </div>
    </div>
  );
}
