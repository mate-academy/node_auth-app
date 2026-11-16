export const login = ` <script src="/scripts/login-form.js" defer></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <main class="main">
    <link rel="stylesheet" href="/styles/form.css">
    <form class="main__form"  action="/enter" method="POST">
    <h1 class="main__title">Log in to your account</h1>
    <div class="main__form-area">
    <label class="main__form-label">Insert your email</label>
    <input class="main__form-input email" name="email" type="email" placeholder="test@contact.com" required />
    <p class="main__error email-error">email field cannot be empty</p>
    </div>
    <div class="main__form-area">
    <label class="main__form-label">enter your password</label>
    <input class="main__form-input password" name="password" type="password" placeholder="your password" required />
    <p class="main__error password-error">password field cannot be empty</p>
    </div>
    <button type="submit">login</button>
    </form>
    <footer class="main__footer">
    <p>New here? <a href="/register">Sign up</a><br>
    <a href="/change-password" class="btn">Change Password</a>
    </p>
    </footer>
    </main>`;
