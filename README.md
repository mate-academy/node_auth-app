# Fullstack Authentication & User Management System

Повноцінний Node.js & React застосунок із реалізованою системою автентифікації, реєстрацією з підтвердженням пошти, відновленням пароля, ротацією JWT-токенів та керуванням профілем користувача.

---

## 🛠️ Стек технологій

* **Backend:** Node.js, Express, Sequelize ORM, PostgreSQL, JWT (Access & Refresh tokens), bcrypt, Nodemailer.
* **Frontend:** React, HTML5, CSS3, Axios / Fetch API.
* **Архітектура:** Monorepo (`server/` та `frontend/`).

---

## ⚡ Основний функціонал

* **Реєстрація та Активація:** Створення акаунту та надсилання листа з токеном активації.
* **Автентифікація (JWT):** Access токен у відповіді API, Refresh токен у захищених `httpOnly` cookies.
* **Керування профілем:** Зміна імені користувача та зміна пароля.
* **Зміна Email:** Запит на зміну електронної пошти з підтвердженням через новий лист.
* **Відновлення пароля:** Скидання забутого пароля за допомогою генерації тимчасового токена та відправки посилання на пошту.

---

## 📋 Попередні вимоги

Переконайтеся, що у вас встановлені:
* **Node.js** (версія 18+)
* **PostgreSQL** (запущена база даних)
* **npm** 

---

## 🚀 Кроки для запуску проєкту

### 1. Клонування репозиторію

```bash
git clone [https://github.com/Dvoris923/node_auth-app.git](https://github.com/Dvoris923/node_auth-app.git)
cd node_auth-app

!!!Налаштування!!! та запуск Server

1 Перейдіть у папку бекенду та встановіть залежності:

cd server

npm install

2 Створіть файл .env у папці server/:

PORT=3005
CLIENT_HOST=http://localhost:3000

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=auth_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Secrets
JWT_KEY=your_super_secret_access_key
JWT_REFRESH_KEY=your_super_secret_refresh_key

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password


3 Запустіть сервер розробки:

npm start


!!!Налаштування!!! та запуск Frontend

1 Відкрийте новий термінал, перейдіть у папку фронтенду та встановіть залежності:

cd frontend
npm install

2 Створіть файл .env у папці frontend/:

VITE_API_URL=http://localhost:3005

3 Запустіть клієнтську частину:

npm run dev

Зауваження щодо безпеки
Файли .env додано до .gitignore і вони не повинні потрапляти у публічні репозиторії.

Для відправки листів через Gmail необхідно згенерувати App Password у налаштуваннях безпеки акаунту Google.