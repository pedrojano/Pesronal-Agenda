import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../../services/api";
import "./Login.css";
import { FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Token Google:", tokenResponse);
        const response = await api.post("/auth/google", {
          access_token: tokenResponse.access_token,
        });

        localStorage.setItem("user_token", response.data.token);
        api.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.token}`;

        navigate("/dashboard");
      } catch (error) {
        console.error("Erro Google:", error);
        alert("Falha no login com Google.");
      }
    },
    onError: () => console.log("Login falhou"),
  });

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("user_token", response.data.token);
      localStorage.setItem("userName", response.data.user.name);
      api.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.token}`;
      navigate("/agenda");
    } catch (error) {
      console.error("Erro ao realizar login: ", error);
      alert("E-mail ou senha incorretos.");
    }
  }

  return (
    <div className="login-page">
      <div className="brand-side">
        <h1>Agenda Pro</h1>
        <p>Sua produtividade, organizada de forma simples e profissional.</p>
      </div>

      <div className="form-side">
        <div className="login-card">
          <div className="form-header">
            <h2>Bem-vindo de volta!</h2>
            <p>Insira suas credenciais para acessar sua conta.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Seu e-mail principal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FiMail className="input-icon" />
            </div>

            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Sua senha segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FiLock className="input-icon" />
            </div>

            <button type="submit" className="btn-primary">
              Entrar
            </button>
          </form>

          <div className="divider">
            <span>ou continue com</span>
          </div>

          <button
            type="button"
            className="btn-google"
            onClick={() => handleGoogle()}
          >
            <FcGoogle className="google-icon" />
            Entrar com Google
          </button>

          <div className="form-footer">
            Não tem uma conta?
            <Link to="/register">Crie agora gratuitamente</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
