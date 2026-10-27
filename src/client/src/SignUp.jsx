import { useEffect, useState } from 'react';
import '../src/style/SignIn.css';
/*eslint-disable*/
const API_URL = 'http://localhost:3000';

function SignUp() {
  const [nickname, setNickName] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);

  const [rules, setRules] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/password-rules`)
      .then((response) => response.json())
      .then((data) => setRules(data.rules || []))
      .catch(() => setRules([]));
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    setErrors({});
    setMessage('');
    setIsLoading(true);

    fetch(`${API_URL}/registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: nickname,
        email: gmail,
        password,
        consent,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          setErrors(data.errors || { form: data.message });

          return;
        }

        setMessage(data.message);
        setNickName('');
        setGmail('');
        setPassword('');
        setConsent(false);
      })
      .catch(() => {
        setErrors({ form: 'Server is not available' });
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="SignUp_page">
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit}>
        <p className="Name Sign">Name</p>
        <input
          type="text"
          value={nickname}
          onChange={(event) => setNickName(event.target.value)}
          required
        />
        {errors.name && <p className="error">{errors.name}</p>}

        <p className="Email Sign">Email</p>
        <input
          type="email"
          value={gmail}
          onChange={(event) => setGmail(event.target.value)}
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <p className="password Sign">Password</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {rules.length > 0 && (
          <ul className="password_rules">
            {rules.map((rule) => (
              <li
                key={rule}
                className={
                  Array.isArray(errors.password) &&
                  errors.password.includes(rule)
                    ? 'error'
                    : ''
                }
              >
                {rule}
              </li>
            ))}
          </ul>
        )}

        <label className="consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
          />
          I agree that my name, email and password (this things will be decoded, or hashed.. idk how should  I name it) are stored in the
          database
        </label>
        {errors.consent && <p className="error">{errors.consent}</p>}

        {errors.form && <p className="error">{errors.form}</p>}
        {message && <p className="success">{message}</p>}

        <button className="button_Sign" type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Sign Up'}
        </button>
      </form>

      <div className="Sign_details">
        <p className="Sign_details_text">Already have an account?</p>
        <a href="#/login">Log in</a>
      </div>
    </div>
  );
}

export default SignUp;
