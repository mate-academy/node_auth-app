export const register = `
    <script src="/scripts/register-form.js" defer></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <main class="main">
    <link rel="stylesheet" href="/styles/form.css">
    <form class="main__form" action="/register" method="POST">
    <h1 class="main__title">Create your account</h1>
    <p class="main__text">Password rules:</p>
    <ul class="main__list">
    <li>• Minimum of 6 characters</li>
    <li>• One uppercase letter</li>
    <li>• One symbol</li>
    </ul>
    <div class="main__form-area">
    <label class="main__form-label">Insert your username</label>
    <input class="main__form-input name" name="username" placeholder="your name" type="text" required />
    <p class="main__error name-error">name field cannot be empty</p>
    </div>
    <div class="main__form-area">
    <label class="main__form-label">Insert your email</label>
    <input class="main__form-input email" name="email" type="email" placeholder="test@contact.com" required />
    <p class="main__error email-error">email field cannot be empty</p>
    </div>
    <div class="main__form-area">
    <label class="main__form-label">enter your password</label>
    <input class="main__form-input password" name="password" type="password" placeholder="your password" required />
    <p class="main__error password-error">password field cannot be empty</p>
    <p class="main__error leng-error">minimum of 6 characteres</p>
    <p class="main__error uppercase-error">one uppercase letter</p>
    <p class="main__error symbol-error">one symbol</p>
    </div>
    <div class="main__form-area">
    <label class="main__form-label">confirm your password</label>
    <input class="main__form-input confirm-password" name="confirm-password" type="password" placeholder="your password" required />
    <p class="main__error confirm-password-error">password field cannot be empty</p>
    <p class="main__error identical-error">password and confirmation must be identical</p>
    </div>
    <button type="submit">register</button>
    </form>
    <footer class="main__footer">
    <p>Already have an account? <a href="/login">Sign in</a></p>
    </footer>
    </main>`;
