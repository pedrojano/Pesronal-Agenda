import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./Profile.css";
import { FiCamera } from "react-icons/fi";
import Swal from "sweetalert2";

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;

    if (avatarPath.startsWith("http")) {
      return avatarPath;
    }

    return `http://localhost:3000/uploads/${avatarPath}`;
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/users/profile");

        setName(response.data.name);
        setEmail(response.data.email);

        const imageSource = response.data.avatar || response.data.avatar_url;

        if (imageSource) {
          setAvatarUrl(getAvatarUrl(imageSource));
        } else {
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        Toast.fire({
          icon: "error",
          title: "Erro ao carregar perfil",
        });
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
      const response = await api.put("/users/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Perfil atualizado com sucesso!",
        showConfirmButton: true,
        confirmButtonColor: "#4CAF50",
        confirmButtonText: "OK",
        
      });

      localStorage.setItem("userName", response.data.user.name);

      setPassword("");
      setAvatarFile(null);

      if (response.data.user && response.data.user.avatar) {
        setAvatarUrl(getAvatarUrl(response.data.user.avatar));
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro ao atualizar perfil",
        text: error.response?.data?.error || "Tente novamente mais tarde.",
      });
    }
  }

  return (
    <div className="profile-container">
      <h2>Meu Perfil</h2>

      <form onSubmit={handleSubmit}>
        <div className="avatar-wrapper">
          <label htmlFor="avatarInput">
            <img
              src={avatarUrl || "https://via.placeholder.com/150"}
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
