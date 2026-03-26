# 🔐 Auth & Accounting App

## 📋 Índice
- [Visão Geral](#-visão-geral)
- [Demo](#-demo)
- [Tecnologias e Ferramentas](#-tecnologias-e-ferramentas)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Arquitetura do Projeto](#️-arquitetura-do-projeto)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [API Endpoints](#-api-endpoints)
- [Banco de Dados](#-banco-de-dados)
- [Autenticação e Segurança](#-autenticação-e-segurança)
- [Frontend (SPA)](#-frontend-spa)
- [Instalação e Execução](#-instalação-e-execução)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Licença](#-licença)
- [Autor](#-autor)

## 🎯 Visão Geral
Aplicação full-stack de **Autenticação e Contabilidade Pessoal** com frontend React (SPA) e backend Node.js/Express 5. Permite registro, login, OAuth social, gestão de despesas e categorias — tudo com isolamento de dados por usuário e interface premium glassmorphism.

### Principais Características:
- ✅ Autenticação completa (registro, login, logout, reset de senha)
- ✅ OAuth Social (Google, GitHub, Apple)
- ✅ Ativação de conta via e-mail (Resend API)
- ✅ JWT com Access Token + Refresh Token (HTTP-only cookies)
- ✅ CRUD de Despesas e Categorias com isolamento por usuário
- ✅ Interface premium com glassmorphism e tema claro/escuro
- ✅ Design 100% responsivo (Mobile First)
- ✅ Banco de dados PostgreSQL com Sequelize ORM
- ✅ Código limpo com ESLint e Prettier

## 🌐 Demo
```
Backend:  http://localhost:3000
Frontend: http://localhost:5173
```

## 🚀 Tecnologias e Ferramentas

### Backend
| Tecnologia | Versão | Função |
|------------|--------|--------|
| [Node.js](https://nodejs.org/) | v24+ | Runtime JavaScript |
| [Express](https://expressjs.com/) | v5.2 | Framework HTTP |
| [PostgreSQL](https://www.postgresql.org/) | v16+ | Banco de dados relacional |
| [Sequelize](https://sequelize.org/) | v6.37 | ORM para PostgreSQL |
| [Passport.js](http://www.passportjs.org/) | v0.7 | OAuth (Google, GitHub, Apple) |
| [JSON Web Token](https://github.com/auth0/node-jsonwebtoken) | v9.0 | Tokens de autenticação |
| [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) | v6.0 | Hash de senhas |
| [Resend](https://resend.com/) | v6.9 | Envio de e-mails transacionais |
| [dotenv](https://dotenvx.com/) | v17.3 | Variáveis de ambiente |

### Frontend
| Tecnologia | Versão | Função |
|------------|--------|--------|
| [React](https://react.dev/) | v19 | Biblioteca UI |
| [TypeScript](https://www.typescriptlang.org/) | v5.7 | Tipagem estática |
| [Vite](https://vitejs.dev/) | v8.0 | Bundler e dev server |
| [React Router](https://reactrouter.com/) | v7 | Roteamento SPA |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Estilização utility-first |
| [shadcn/ui](https://ui.shadcn.com/) | latest | Componentes UI |
| [Framer Motion](https://motion.dev/) | latest | Animações |
| [Lucide React](https://lucide.dev/) | latest | Ícones |

### Qualidade de Código
| Ferramenta | Função |
|------------|--------|
| [ESLint](https://eslint.org/) | Linting JavaScript/TypeScript |
| [Prettier](https://prettier.io/) | Formatação de código |
| [Jest](https://jestjs.io/) | Testes unitários |

## ✨ Funcionalidades Implementadas

### 1. 🔑 Autenticação Completa
- Registro com nome, e-mail e senha (validação de regras de senha)
- Ativação de conta via link enviado por e-mail (Resend API)
- Login com credenciais (e-mail + senha)
- Logout seguro com limpeza de cookies HTTP-only
- Reset de senha via e-mail com token de confirmação
- Refresh automático de Access Token via Refresh Token

### 2. 🌐 OAuth Social
- Login com Google (passport-google-oauth20)
- Login com GitHub (passport-github2)
- Login com Apple (passport-apple)
- Upsert automático: cria conta ou vincula provedor a conta existente

### 3. 💰 Gestão de Despesas
- CRUD completo (criar, listar, editar, excluir)
- Filtros por data (de/até), título e categoria
- Valores em Reais (R$) formatados
- Isolamento total: cada usuário vê apenas suas despesas

### 4. 🏷️ Gestão de Categorias
- CRUD completo de categorias personalizadas
- Vinculação de categorias às despesas
- Isolamento por usuário

### 5. 👤 Perfil do Usuário
- Alterar nome
- Alterar senha (exige senha antiga + confirmação)
- Alterar e-mail (exige senha + confirmação por e-mail)
- Visualização de provedores OAuth vinculados

### 6. 🎨 Interface Premium
- Design glassmorphism com efeitos blur e transparência
- Tema claro/escuro com transição suave
- Componentes shadcn/ui personalizados
- Micro-animações com Framer Motion
- Layout responsivo Mobile First

## 🏗️ Arquitetura do Projeto

O projeto segue uma **Arquitetura em Camadas (Layered Architecture)** no backend e **Component-Based Architecture** no frontend.

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (React SPA)                  │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐    │
│  │  Pages/     │  │  Context/    │  │  API Clients      │    │
│  │  Components │  │  AuthContext │  │  (fetch + cookies) │    │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬─────────┘    │
│         └───────────┬────┘                    │              │
│                     │         Vite Proxy       │              │
├─────────────────────┼─────────────────────────┼──────────────┤
│                     ▼                         ▼              │
│                  BACKEND (Express 5)                          │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Routes → Controllers → Services → Models (Sequelize)│    │
│  └──────────────────────────────────────────────────────┘    │
│         │              │              │                       │
│  ┌──────┴──────┐ ┌─────┴──────┐ ┌────┴──────┐               │
│  │ Middlewares  │ │  Passport  │ │ PostgreSQL │               │
│  │ (auth, err) │ │  (OAuth)   │ │ (Sequelize)│               │
│  └─────────────┘ └────────────┘ └────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

### Fluxo de Autenticação

```
┌────────┐     ┌─────────┐     ┌───────────┐     ┌──────────┐
│ Browser │────▶│  Vite   │────▶│  Express  │────▶│ Postgres │
│         │◀────│  Proxy  │◀────│  (JWT)    │◀────│          │
└────────┘     └─────────┘     └───────────┘     └──────────┘
    │                               │
    │  HTTP-only Cookies            │  bcrypt hash
    │  (accessToken, refreshToken)  │  Sequelize ORM
    │                               │  Passport OAuth
```

## 📂 Estrutura de Pastas

```
node_auth-app/
├── 📄 .env                    # Variáveis de ambiente (não versionado)
├── 📄 .env.example            # Template de variáveis de ambiente
├── 📄 .eslintrc.js            # Configuração ESLint
├── 📄 .prettierrc             # Configuração Prettier
├── 📄 package.json            # Dependências e scripts (backend)
├── 📄 readme.md               # Esta documentação
│
├── 📁 src/                    # Código-fonte do Backend
│   ├── 📄 index.js            # Entry point (inicia o servidor HTTP)
│   ├── 📄 createServer.js     # Factory do Express (middlewares + rotas)
│   ├── 📄 setup.js            # Conexão Sequelize com PostgreSQL
│   │
│   ├── 📁 config/
│   │   └── 📄 passport.js     # Estratégias OAuth (Google, GitHub, Apple)
│   │
│   ├── 📁 models/
│   │   ├── 📄 User.js         # Modelo de Usuário (Sequelize)
│   │   ├── 📄 Expense.js      # Modelo de Despesa
│   │   └── 📄 Category.js     # Modelo de Categoria
│   │
│   ├── 📁 controllers/
│   │   ├── 📄 authController.js       # Login, registro, logout, reset
│   │   ├── 📄 userController.js       # Perfil (nome, senha, e-mail)
│   │   ├── 📄 expenses.controller.js  # CRUD despesas
│   │   └── 📄 categories.controller.js # CRUD categorias
│   │
│   ├── 📁 services/
│   │   ├── 📄 authService.js          # Lógica de autenticação
│   │   ├── 📄 userService.js          # Operações de usuário no DB
│   │   ├── 📄 tokenService.js         # Geração/validação JWT
│   │   ├── 📄 jwtService.js           # Wrapper do jsonwebtoken
│   │   ├── 📄 emailService.js         # Envio de e-mails (Resend)
│   │   ├── 📄 expenses.service.js     # Lógica de despesas
│   │   └── 📄 categories.service.js   # Lógica de categorias
│   │
│   ├── 📁 routes/
│   │   ├── 📄 authRoutes.js           # POST /auth/*
│   │   ├── 📄 userRoutes.js           # GET/PATCH /profile/*
│   │   ├── 📄 oauthRoutes.js          # GET /auth/google, /auth/github
│   │   ├── 📄 expensesRoutes.js       # CRUD /accounting/expenses
│   │   └── 📄 categoriesRoutes.js     # CRUD /accounting/categories
│   │
│   ├── 📁 middlewares/
│   │   ├── 📄 authMiddleware.js       # Valida JWT (rotas protegidas)
│   │   ├── 📄 guestMiddleware.js      # Bloqueia acesso se autenticado
│   │   └── 📄 errorMiddleware.js      # Handler global de erros
│   │
│   └── 📁 utils/
│       ├── 📄 ApiError.js             # Classe de erro customizada
│       └── 📄 validatePassword.js     # Validação de regras de senha
│
└── 📁 client/                 # Código-fonte do Frontend (React)
    ├── 📄 package.json        # Dependências frontend
    ├── 📄 vite.config.js      # Config Vite (proxy para backend)
    ├── 📄 index.html          # Entry point HTML
    │
    └── 📁 src/
        ├── 📄 main.jsx        # Bootstrap React
        ├── 📄 App.jsx         # Rotas e providers
        │
        ├── 📁 api/
        │   ├── 📄 authApi.js      # Chamadas de autenticação
        │   ├── 📄 expenseApi.ts   # Chamadas de despesas
        │   └── 📄 categoryApi.ts  # Chamadas de categorias
        │
        ├── 📁 context/
        │   ├── 📄 AuthContext.jsx     # Provider de autenticação
        │   ├── 📄 authContextValue.js # Contexto React
        │   └── 📄 useAuth.js         # Hook customizado
        │
        ├── 📁 styles/
        │   ├── 📄 tailwind.css    # Import Tailwind CSS
        │   ├── 📄 theme.css       # Design tokens (cores, tipografia)
        │   ├── 📄 index.css       # Imports globais
        │   └── 📄 fonts.css       # Google Fonts (Inter)
        │
        └── 📁 app/components/
            ├── 📄 login-page.tsx          # Página de login
            ├── 📄 register-page.tsx       # Página de registro
            ├── 📄 activation-page.tsx     # Ativação via e-mail
            ├── 📄 reset-password-page.tsx # Solicitar reset
            ├── 📄 reset-confirm-page.tsx  # Confirmar reset
            ├── 📄 dashboard-page.tsx      # Dashboard principal
            ├── 📄 expenses-page.tsx       # Gestão de despesas
            ├── 📄 categories-page.tsx     # Gestão de categorias
            ├── 📄 profile-page.tsx        # Perfil do usuário
            ├── 📄 not-found-page.tsx      # Página 404
            ├── 📄 app-layout.tsx          # Layout (navbar + sidebar)
            ├── 📄 auth-layout.tsx         # Layout das telas de auth
            ├── 📄 protected-route.tsx     # Route guard (autenticado)
            ├── 📄 guest-route.tsx         # Route guard (não autenticado)
            ├── 📄 theme-provider.tsx      # Provider de tema
            ├── 📄 theme-toggle.tsx        # Botão claro/escuro
            └── 📁 ui/                     # 48 componentes shadcn/ui
```

## 🔌 API Endpoints

### Autenticação (`/auth`)
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Registrar novo usuário |
| `GET` | `/auth/activate/:token` | Ativar conta via e-mail |
| `POST` | `/auth/login` | Login com e-mail e senha |
| `POST` | `/auth/logout` | Logout (limpa cookies) |
| `GET` | `/auth/refresh` | Renovar Access Token |
| `POST` | `/auth/reset-password` | Solicitar reset de senha |
| `POST` | `/auth/reset-password/:token` | Confirmar nova senha |

### OAuth (`/auth`)
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/auth/google` | Login com Google |
| `GET` | `/auth/github` | Login com GitHub |
| `GET` | `/auth/apple` | Login com Apple |

### Perfil (`/profile`)
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/profile` | Obter dados do perfil |
| `PATCH` | `/profile/name` | Alterar nome |
| `PATCH` | `/profile/password` | Alterar senha |
| `PATCH` | `/profile/email` | Alterar e-mail |

### Contabilidade (`/accounting`) — 🔒 Requer autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/accounting/expenses` | Listar despesas (filtros via query) |
| `GET` | `/accounting/expenses/:id` | Obter despesa por ID |
| `POST` | `/accounting/expenses` | Criar despesa |
| `PATCH` | `/accounting/expenses/:id` | Editar despesa |
| `DELETE` | `/accounting/expenses/:id` | Excluir despesa |
| `GET` | `/accounting/categories` | Listar categorias |
| `GET` | `/accounting/categories/:id` | Obter categoria por ID |
| `POST` | `/accounting/categories` | Criar categoria |
| `PATCH` | `/accounting/categories/:id` | Editar categoria |
| `DELETE` | `/accounting/categories/:id` | Excluir categoria |

## 🗄️ Banco de Dados

### Modelos Sequelize

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │       │   Expense    │       │   Category   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │       │ id (PK)      │
│ name         │  ├───▶│ userId (FK)  │   ┌──▶│ userId (FK)  │
│ email (UQ)   │  │    │ title        │   │   │ name         │
│ password     │  │    │ amount       │   │   └──────────────┘
│ isActive     │  │    │ spentAt      │   │
│ activationT. │  │    │ category     │   │
│ resetToken   │  │    │ note         │   │
│ googleId     │  └───▶│              │   │
│ githubId     │───────┼──────────────┘   │
│ appleId      │       │                  │
└──────────────┘       └──────────────────┘
```

## 🔒 Autenticação e Segurança

| Recurso | Implementação |
|---------|---------------|
| Hash de senha | bcrypt (12 rounds) |
| Tokens JWT | Access (15min) + Refresh (7 dias) |
| Cookies | HTTP-only, SameSite=Lax |
| Cache | `Cache-Control: no-store` em todas as rotas |
| OAuth | Passport.js (Google, GitHub, Apple) |
| Isolamento | `userId` filtrado em todas as queries Sequelize |
| CORS | Origin whitelist + credentials |
| Tratamento de erros | Middleware global com ApiError |

## 🖥️ Frontend (SPA)

### Design System
| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| Background | `#0a0a0f` | `#f8faf9` |
| Primary | `#6366f1` (Indigo) | `#10b981` (Emerald) |
| Card | `#12121a` | `#ffffff` |
| Border | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` |
| Font | Inter (Google Fonts) | Inter (Google Fonts) |

### Rotas
| Rota | Componente | Acesso |
|------|------------|--------|
| `/login` | LoginPage | Apenas visitantes |
| `/register` | RegisterPage | Apenas visitantes |
| `/activate/:token` | ActivationPage | Apenas visitantes |
| `/reset-password` | ResetPasswordPage | Apenas visitantes |
| `/reset-password/:token` | ResetConfirmPage | Apenas visitantes |
| `/` | DashboardPage | 🔒 Autenticado |
| `/expenses` | ExpensesPage | 🔒 Autenticado |
| `/categories` | CategoriesPage | 🔒 Autenticado |
| `/profile` | ProfilePage | 🔒 Autenticado |
| `*` | NotFoundPage | Público |

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js v18 ou superior
- PostgreSQL v16 ou superior
- npm v9 ou superior

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/glauccoeng-prog/node_auth-app.git
cd node_auth-app

# 2. Instale as dependências do backend
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais PostgreSQL e API keys

# 4. Instale as dependências do frontend
cd client
npm install
cd ..

# 5. Inicie o backend
npm run start
# Servidor rodando em http://localhost:3000

# 6. Em outro terminal, inicie o frontend
cd client
npm run dev
# Frontend rodando em http://localhost:5173
```

## 📜 Scripts Disponíveis

### Backend (`/`)
| Comando | Descrição |
|---------|-----------|
| `npm run start` | Inicia o servidor Node.js |
| `npm run lint` | Formata + verifica código |
| `npm run format` | Formata com Prettier |
| `npm run test` | Lint + testes |
| `npm run test:only` | Apenas testes |

### Frontend (`/client`)
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server Vite (hot reload) |
| `npm run build` | Build de produção |
| `npm run lint` | Verifica código com ESLint |
| `npm run preview` | Preview do build |

## 🔑 Variáveis de Ambiente

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=auth_app

# JWT
JWT_ACCESS_SECRET=seu_secret_access
JWT_REFRESH_SECRET=seu_secret_refresh

# OAuth - Google
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# OAuth - GitHub
GITHUB_CLIENT_ID=seu_github_client_id
GITHUB_CLIENT_SECRET=seu_github_client_secret

# E-mail (Resend)
RESEND_API_KEY=re_sua_chave_api
EMAIL_FROM=noreply@seudominio.com

# Geral
CLIENT_URL=http://localhost:5173
SESSION_SECRET=seu_session_secret
```

## 📄 Licença
Este projeto está sob a licença GPL-3.0. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 👨‍💻 Autor
**Glaucco Siqueira**
- GitHub: [@glauccoeng-prog](https://github.com/glauccoeng-prog)
