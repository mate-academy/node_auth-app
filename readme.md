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

# Приложение для аутентификации
Реализуйте приложение, позволяющее пользователю:
- Зарегистрироваться, указав имя, email и пароль (только для неавторизованных пользователей)
  - Информировать пользователей о требованиях к паролю и проверять их соблюдение
  - Отправлять письмо для активации аккаунта
- Страница активации (только для неавторизованных пользователей)
  - Активация аккаунта должна происходить только после подтверждения email
  - Перенаправление на страницу профиля после активации
- Войти в систему с действительными учетными данными (email и пароль) (только для неавторизованных пользователей)
  - Если аккаунт не активирован, предложить пользователю подтвердить email
  - Перенаправление на страницу профиля после входа
- Выйти из системы (только для авторизованных пользователей)
  - Перенаправление на страницу входа после выхода
- Сброс пароля (только для неавторизованных пользователей)
  - Запрос email
  - Отображение страницы с сообщением об отправке письма
  - Добавление страницы подтверждения сброса пароля (с полями `password` и `confirmation`, значения которых должны совпадать)
  - Отображение страницы успеха со ссылкой на вход
- Страница профиля (только для авторизованных пользователей)
  - Возможность изменить имя
  - Возможность изменить пароль (требуется ввод старого пароля, нового пароля и его подтверждения)
  - Для изменения email необходимо ввести пароль, подтвердить новый email и уведомить старый email об изменении
- Страница 404 для всех остальных путей

## (Опционально) Дополнительные задачи
- Реализовать регистрацию через Google, Facebook, Github (использовать библиотеку Passport.js)
- На странице профиля должна быть возможность добавить или удалить привязку к аккаунту в социальной сети
- Добавить аутентификацию в ваше приложение для учета (Accounting App)
