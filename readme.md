# Auth application
Implement an application that allows user to:
- Register using name, email and password (only non authenticated)
  - Inform the users about the rules for a password and check them
  - send and activation email
- Actvation page (only non authenticated)
  - the user should be activated only after email confirmation
  - redirect to Profile after the activation
- Login with valid credentials (email and password) (only non authenticated)
  - If user is not active ask them to activate their email
  - Redirect to profile after login
- Logout (only authenticated)
  - Redirect to login after logging out
- Password reset (only non authenticated)
  - Ask for an email
  - Show email sent page
  - add Reset Password confirmation page (with `password` and `confirmation` fields that must be equal)
  - Show Success page with a link to login
- Profile page (only authenticated)
  - You can change a name
  - It allows to change a password (require an old one, `new password` and `confirmation`)
  - To change an email you should type the password, confirm the new email and notify the old email about the change
- 404 for all the other pages

## (Optional) Advanced tasks
- Implement Sign-up with Google, Facebook, Github (use Passport.js lib)
- Profile page should allow to add/remove any social account
- Add authentication to your Accounting App

## //-----------------------------------------------------//
Привіт! Ось покроковий план, як підняти бекенд і підʼєднати його до фронтенда з репозиторієм mate-academy/login-app.

Підготуй бекенд


Обери стек: Node.js + Express + JWT + Nodemailer (або будь-який інший, що зручний).
Створи .env з налаштуваннями:

APP_URL (URL фронтенда, напр. http://localhost:3000)
API_URL (URL бекенда, напр. http://localhost:4000)
JWT_SECRET
EMAIL_SMTP_* (для надсилання листів)


Реалізуй REST-ендпоїнти:

POST /api/auth/register — реєстрація, валідація пароля (мін. довжина, цифра, літера, спецсимвол), створення користувача зі статусом inactive, відправка листа з токеном активації (лінк виду: APP_URL/activate?token=...).
GET /api/auth/activate?token=... — активує користувача, після чого фронт має редіректити на профіль.
POST /api/auth/login — логін (email + password). Якщо inactive — повернути 403 і повідомлення ніби “підтвердіть email”.
POST /api/auth/logout — інвалювати refresh-токен або видалити сесію (за потреби).
POST /api/auth/forgot-password — приймає email, шле листа з лінком: APP_URL/reset-password?token=...
POST /api/auth/reset-password — приймає token, password, confirmation. Міняє пароль.
GET /api/profile — повертає дані профілю (авторизований).
PATCH /api/profile/name — змінює імʼя (авторизований).
PATCH /api/profile/password — змінює пароль, вимагає oldPassword, newPassword, confirmation.
PATCH /api/profile/email — зміна email: вимагає password, новий email + підтвердження, надсилає нотифікацію на старий email.


Авторизація:

При логіні повертай accessToken (JWT) і, якщо треба, refreshToken.
На захищені ендпоїнти — заголовок Authorization: Bearer <token>.


Налаштуй CORS і cookies (якщо потрібно)


Якщо використовуєш JWT у cookies (httpOnly), увімкни:

На бекенді: CORS з origin: APP_URL, credentials: true; встановлюй cookie з флагами httpOnly, secure у проді.
На фронті: fetch/axios з credentials: 'include'.


Якщо токен у LocalStorage — просто додай Authorization заголовок на фронті.


Підготуй фронтенд (mate-academy/login-app)


Перевір змінні середовища у фронті (зазвичай REACT_APP_API_URL або VITE_API_URL). Встанови на URL бекенда, напр. http://localhost:4000.
У сервісах API заміни базовий URL на REACT_APP_API_URL/VITE_API_URL.
Додай інтерцептор до axios (або перехоплювач fetch), що додає Authorization: Bearer <token> для захищених запитів.
Обробка роутів:

Публічні: /register, /login, /activate, /forgot-password, /reset-password.
Приватні: /profile.
Додай guard: якщо немає токена — редірект на /login. Якщо користувач неактивний — показати повідомлення та кнопку “Надіслати лист повторно” (опціонально).


Форми:

Register: показати правила пароля і робити клієнтську перевірку ще до запиту.
Activate: зчитати token з query, викликати GET /api/auth/activate, при успіху — редірект на /profile.
Login: при 403 inactive — показати підказку активувати email.
Forgot Password: відправляє email, показує “лист відправлено”.
Reset Password: приймає token з query, відправляє password + confirmation, при успіху — лінк на /login.
Profile:

Зміна імені — PATCH /api/profile/name.
Зміна пароля — перевірка old/new/confirmation на фронті + PATCH /api/profile/password.
Зміна email — форма з полем password, newEmail, confirmation; PATCH /api/profile/email; показати нотифікацію.




404: налаштуй fallback-роут.


Як звʼязати запуск


Запусти бекенд: npm run dev на порту 4000.
Запусти фронтенд: npm start або npm run dev на 3000.
Переконайся, що:

REACT_APP_API_URL/VITE_API_URL = http://localhost:4000
CORS на бекенді дозволяє http://localhost:3000
Якщо cookies: і бекенд, і фронт з credentials.




Типові помилки і як їх уникнути


401/403 на приватних сторінках: перевір наявність токена і заголовка Authorization або cookies з credentials.
Проблеми з CORS: додай exact origin і credentials: true.
Токени в проді: став secure, sameSite='None' для cross-site cookies.
Неправильний редірект після активації/логіну/логауту — перевір navigate('/profile') або window.location заміну.


Що реалізувати мінімально для проходження вимог


Реєстрація з валідацією пароля + лист активації.
Активація по лінку з токеном.
Логін і перевірка active.
Логаут і редірект на /login.
Скидання пароля (2 кроки).
Профіль з оновленням імені, пароля, email (з підтвердженням і нотифікацією на старий email).
404 роут.
