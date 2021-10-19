# Auth server
Write a server that allow a user to sign up and sign in using email and password
- `/sign-up` - returns a page with a form (`email`, `name`, `password`, `confirmation`)
- The form sends data to `/sing-up/try` using `GET` method
- `/sing-up/try` - reads the data from `query` and checks if such user already exists and adds a user to `users.json` with a unique `id` (the biggest existing `id` + 1)
  - If the user already exists return a form with an error
  - If not return a success message with a link to `/login` page
- `/login` page shows a login form sending data to `/login/try` using `GET` method
- `/login/try` reads an `email` and `password` from the `query` and compares with the data in `users.json`
  - if the `email/password` pair is not correct, show the login for with an error message
  - otherwise show success message with the user name
- All the othe URLS should return 404
