import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./Profile.css";
import { FiCamera } from "react-icons/fi";
import { toast } from "react-toastify";

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("users/profile");
        setName(response.data.name);
        setEmail(response.data.email);

        if (response.data.avatar) {
          setAvatarUrl(`http://localhost:3000/uploads/${response.data.avatar}`);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
        toast.error("Erro ao carregar perfil");
      }
    }
    loadProfile();
  }, []);

  function handleFileChange(e) {
    const file = e.target.files[0];

    if (file) {
      setAvatarFile(file); 
      setAvatarUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const data = new FormData();
    data.append("name", name);
    data.append("email", email);

    if (password) {
      data.append("password", password);
    }

    if (avatarFile) {
      data.append("avatar", avatarFile);
    }

    try {
      await api.put("/users/profile", data);
      toast.success("Perfil atualizado com sucesso!");

      localStorage.setItem("userName", name);
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
      console.error(error);
    }
  }

  return (
    <div className="profile-container">
      <h2>Meu Perfil</h2>

      <form onSubmit={handleSubmit}>
        <div className="avatar-wrapper">
          <label htmlFor="avatarInput">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="avatar-image"
            />
            <div className="avatar-overlay">
              <FiCamera />
            </div>
          </label>
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="form-group">
          <label>Nome Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Nova Senha (deixe em branco para manter)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </div>

        <button type="submit" className="btn-save">
          Salvar Alterações
        </button>
      </form>
    </div>
  );
} 