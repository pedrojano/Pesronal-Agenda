import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Register.css";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      toast.success("Conta criada com sucesso!");
    

      localStorage.setItem("user_token", response.data.token);

      navigate("/agenda"); 
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      toast.error("Erro ao criar conta. Tente novamente.");
    }
  }

  function handleGoogleLogin() {
    toast.info("Use a tela de login para acessar com o google.");
  }

  return (
    <div className="register-page">
      <div className="brand-side">
        <h1>Junte-se a nós!</h1>
        <p>Comece a organizar a sua vida pessoal e profissional hoje mesmo.</p>
      </div>
      <div className="form-side">
        <div className="register-card">
          <div className="form-header">
            <h2>Crie sua conta</h2>
            <p>Preencha os dados abaixo para começar.</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <FiUser className="input-icon" />
            </div>

            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FiMail className="input-icon" />
            </div>

            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FiLock className="input-icon" />
            </div>

            <button type="submit" className="btn-primary">
              Criar conta
            </button>
          </form>

          <div className="divider">
            <span>ou registre-se com</span>
          </div>

          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={24} />
            Google
          </button>

          <div className="form-footer">
            Já tem uma conta?
            <Link to="/login">Fazer Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
