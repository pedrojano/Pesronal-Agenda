# 📅 Agenda Pro

> Sua produtividade, organizada de forma simples e profissional.

O **Agenda Pro** é uma aplicação web completa (Fullstack) para gerenciamento de tarefas pessoais. O projeto permite que usuários criem contas, façam login seguro (incluindo autenticação via Google) e gerenciem seus compromissos diários.

## 🚀 Tecnologias Utilizadas

### Frontend (Client)

- **React.js** (com Vite)
- **React Router Dom** (Navegação)
- **@react-oauth/google** (Autenticação Social)
- **Axios** (Comunicação com API)
- **CSS3** (Estilização modular)

### Backend (Server)

- **Node.js** & **Express**
- **PostgreSQL** (Banco de Dados)
- **JWT (JsonWebToken)** (Segurança de sessão)
- **BCrypt.js** (Criptografia de senhas)
- **Google Auth Library** (Validação de tokens)

---

## ⚙️ Funcionalidades

- [x] **Autenticação Segura:** Login e Cadastro com E-mail e Senha (Hash).
- [x] **Login Social:** Integração completa com **Google OAuth 2.0**.
- [x] **Gerenciamento de Sessão:** Uso de JWT para proteção de rotas privadas.
- [ ] **Dashboard:** Área exclusiva para usuários logados (Em desenvolvimento).
- [ ] **CRUD de Tarefas:** Criar, Editar, Excluir e Listar tarefas (Em desenvolvimento).
- [ ] **Notificações:** Alertas de horário de tarefas (Em desenvolvimento).
- [ ] **Agente de IA:** Para cronogramas e otmização do tempo no dia a dia (Em desenvolvimento).

---

## 📂 Estrutura do Projeto

O projeto é dividido em dois diretórios principais:

```bash
/agenda-app
│
├── /server  # API Rest, Regras de Negócio e Conexão com Banco
│   ├── /src
│   │   ├── /controllers  # Lógica (Auth, Tasks)
│   │   ├── /routes       # Rotas da API
│   │   └── /config       # Configuração do DB
│
└── /client  # Interface do Usuário (React)
    ├── /src
    │   ├── /pages        # Telas (Login, Dashboard)
    │   ├── /services     # Configuração do Axios
    │   └── /components   # Botões, Inputs, Modais

```

🛠️ Como Rodar o Projeto
Pré-requisitos
Node.js instalado

PostgreSQL instalado e rodando

Conta no Google Cloud (para obter o Client ID)

1. Configuração do Banco de Dados
   No seu PGAdmin ou terminal SQL, crie o banco e as tabelas:

```SQL

CREATE DATABASE agenda_db;

-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    google_id VARCHAR(255),
    avatar_url TEXT
);

-- Tabela de Tarefas (Futuro)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pendente'
);
```

2. Configurando Variáveis de Ambiente (.env)
   No Backend (/server/.env):

Snippet de código

```
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agenda_db
JWT_SECRET=seu_segredo_super_secreto
No Frontend (/client/.env):
```

Snippet de código

```
VITE_GOOGLE_CLIENT_ID=seu_client_id_do_google.apps.googleusercontent.com
```

3. Instalando e Rodando
   Terminal 1 - Backend:

Bash:

```
cd server
npm install
npm run dev
```

# Servidor rodará na porta 3000 (ou a definida)

Terminal 2 - Frontend:

Bash:

```
cd client
npm install
npm run dev
```

# React rodará na porta 5173

Acesse http://localhost:5173 no seu navegador.

🔐 Detalhes da Autenticação Google
A autenticação utiliza o fluxo de Access Token.

O Frontend usa o hook useGoogleLogin para obter permissão do usuário.

O Frontend envia o token recebido para a rota /auth/google do Backend.

O Backend valida o token diretamente com a API do Google (googleapis.com/userinfo).

Se válido, o Backend cria ou atualiza o usuário no banco PostgreSQL e retorna um JWT da aplicação.

📝 Autor
Desenvolvido por Pedro Henrique Janó
