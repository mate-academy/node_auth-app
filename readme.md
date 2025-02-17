# **Node.js Authentication API**

## **1️⃣ Project Overview**

This project is the backend part of an **authentication system** based on **Node.js** and **Express**.  
It supports **registration, login, password change, account activation via email, logout, token refresh, and account management**.  
The project uses **Sequelize ORM** to work with the **PostgreSQL** database and **JWT tokens** for authentication.

---

## **2️⃣ Frontend Links**

🔗 **Frontend Repository:**  
[GitHub: Frontend](https://github.com/DmytroHoncharuk/nodejs-theory_login-app-react)

🚀 **Frontend Deployment:**  
(https://authapp-dmytrohoncharuk.onrender.com)

---

## **🚀 Live Demo**

🔗 **Demo:** [authapp-dmytrohoncharuk.onrender.com](https://authapp-dmytrohoncharuk.onrender.com)

📌 **Test Credentials:**
- **Email:** `authApp@pokemail.net`
- **Password:** `123123`


### ⚠ Warning: The Server May Be in Sleep Mode

If you have just launched the application, please wait up to **1 minute**.

🚀 The server may be in **sleep mode**, and it needs some time to wake up and start processing requests.

🔄 If the application does not respond after waiting, try **reloading the page** or **retrying the request**.

**Thank you for your patience!**

---

## **3️⃣ Technologies and Features**

- ✅ **Node.js & Express** – backend framework  
- ✅ **Sequelize ORM** – PostgreSQL database handling  
- ✅ **PostgreSQL** – relational database  
- ✅ **JWT tokens** – authentication and refresh mechanism  
- ✅ **Cookies** – refresh token storage  
- ✅ **bcrypt** – password hashing  
- ✅ **dotenv** – environment variable management  
- ✅ **CORS** – API security  
- ✅ **Nodemailer** – email sending service  
- ✅ **Axios** – HTTP request client  
- ✅ **Render.com** – hosting and deployment  
- ✅ **Server-side validation** – input data verification
- ✅ Full server-side validation is implemented.
- ✅ Full client-side validation is implemented.
- ✅ AuthContext is used for storing authenticated user data.

---

## **4️⃣ Server-side Validation**

Before processing, each request undergoes **validation** to ensure data integrity and prevent malicious input.

### 🔹 **Registration**
- Email must have a **valid format**
- Password must be **at least 6 characters long**
- Name must be **at least 5 characters long**

### 🔹 **Login**
- Ensures the email exists  
- Verifies **password correctness**

### 🔹 **Password Change**
- New password must be **at least 6 characters long**
- Cannot be the **same as the old password**

### 🔹 **Email Change**
- The **new email** must be different from the old one  
- If the email is changed, a notification is sent to the **old email**

### 🔹 **Name Change**
- The new name must be **at least 5 characters long**

### 🔹 **Error Handling**
If the user enters incorrect data, the server returns **clear error messages**, which are displayed on the frontend.

---

## **5️⃣ How to Run Locally**

### **📌 Installation**
```bash
git clone https://github.com/YOUR_LINK.git
cd node_auth-app
npm install
```

### **📌 Environment Variables Setup**
Create a `.env` file in the root directory and add:

```
PORT
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_DATABASE
JWT_SECRET
CLIENT_HOST
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
```

###**SMTP: Email Sending Setup**
The project uses an **SMTP server** for sending emails (e.g., for account activation).  
To set up SMTP, you need to configure it via an external service (Gmail, SendPulse, Mailgun, etc.).

🔗 **How to Set Up SMTP:**  
[SMTP Setup Guide](https://sendpulse.ua/knowledge-base/smtp/setup-smtp-server)

### ** PostgreSQL Database Initialization**
The project uses **PostgreSQL** to store users and tokens.  
To create tables in the database, you need to **run the `setup.js` file**, which initializes the schema.

📌 **To create tables, run the command:**
```bash
node src/setup.js
```
⚡ This will create all the necessary tables defined in the Sequelize models.

### **📌 Start the Server**
```bash
npm start
```
⚡ The server will start at `http://localhost:3005`
