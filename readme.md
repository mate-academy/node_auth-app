# Auth application
Implement an application that allows user to:
- Register using name, email and password
  - Inform the users about the rules for a password and check them
  - the user should be activated only after email confirmation
- Login with valid credentials (email and password)
  - If user is not active ask them to activate their email
- Password reset
  - Ask for an email
  - Show email sent page
  - add Reset Password confirmation page (with `password` and `confirmation` fields that must be equal)
  - Show Success page with a link to login
- Profile page is visible only for authorized users
  - You can change a name
  - It allows to change a password (require an old one, `new password` and `confirmation`)
  - To change an email you should type the password, confirm the new email and notify the old email about the change

## (Optional) Advanced tasks
- Implement Sign-up with Google, Facebook, Github (use Passport.js lib)
- Profile page should allow to add/remove any social account
