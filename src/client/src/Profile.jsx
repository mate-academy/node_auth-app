import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../src/Loader/Loader.jsx';
import '../src/style/SignIn.css';

const API_URL = 'http://localhost:3000';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [nickname, setNickName] = useState('');

  const [Thispassword, setThisPassword] = useState('');
  const [newPassword, setnewPassword] = useState('');
  const [reallyNew, setReallyNew] = useState('');

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/log-in');

      return;
    }

    fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        return data;
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        // Токен просрочений
        localStorage.removeItem('accessToken');
        navigate('/log-in');
      });
  }, [navigate]);

  async function handleLogout() {
    const token = localStorage.getItem('accessToken');

    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      localStorage.removeItem('accessToken');
      navigate('/log-in');
    }
  }

  if (!user) {
    return <Loader />;
  }

  function handleSubmit(event) {
    const token = localStorage.getItem('accessToken');

    event.preventDefault();

    setErrors({});
    setMessage('');
    setIsLoading(true);

    fetch(`${API_URL}/patching`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: nickname,
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
      })
      .catch(() => {
        setErrors({ form: 'Server is not available' });
      })
      .finally(() => setIsLoading(false));
  }

  // passsubmit
  function passwordSubmit(event) {
    const token = localStorage.getItem('accessToken');

    event.preventDefault();

    setErrors({});
    setIsLoading(true);

    fetch(`${API_URL}/patching/parol`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: user.email,
        password: Thispassword,
        newPassword: newPassword,
        confirmation: reallyNew,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          setErrors(data.errors || { form: data.message });

          return;
        }

        setMessage(data.message);
      })
      .catch(() => {
        setErrors({ form: 'Server is not available' });
      })
      .finally(() => setIsLoading(false));
  }

  function handleEmailSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem('accessToken');

    setErrors({});
    setMessage('');
    setIsLoading(true);

    // Старий email не надсилаємо: сервер визначає акаунт за токеном
    fetch(`${API_URL}/profile/email`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password, newEmail, confirmEmail }),
    })
      .then(async (response) => {
        // 401 означає недійсний токен (неправильний пароль дає 400)
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/log-in');

          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setErrors(data.errors || { form: data.message });

          return;
        }

        setMessage(data.message);
        setUser(data.user);
        setPassword('');
        setNewEmail('');
        setConfirmEmail('');
      })
      .catch(() => setErrors({ form: 'Server is not available' }))
      .finally(() => setIsLoading(false));
  }

  return (
    <>
      <div className="SignUp_page">
        <div className="SignUp_page">
          <h1>Profile</h1>

          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>

          <button className="button_Sign" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="Name Sign">Name</p>
          <input
            type="text"
            value={nickname}
            onChange={(event) => setNickName(event.target.value)}
            required
          />
          {errors.name && <p className="error">{errors.name}</p>}
          <button className="button_Sign" type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'change'}
          </button>
        </form>
        <h2>Change email</h2>

        <form onSubmit={handleEmailSubmit}>
          <p className="password Sign">Password</p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <p className="Email Sign">New email</p>
          <input
            type="email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            required
          />
          {errors.newEmail && <p className="error">{errors.newEmail}</p>}

          <p className="Email Sign">Confirm new email</p>
          <input
            type="email"
            value={confirmEmail}
            onChange={(event) => setConfirmEmail(event.target.value)}
            required
          />
          {errors.confirmEmail && (
            <p className="error">{errors.confirmEmail}</p>
          )}

          {errors.form && <p className="error">{errors.form}</p>}

          <button className="button_Sign" type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Change email'}
          </button>
        </form>

        <form onSubmit={passwordSubmit}>
          <h2>Change Password</h2>
          <p className="password Sign">Write old password here</p>
          <input
            type="password"
            value={Thispassword}
            onChange={(event) => setThisPassword(event.target.value)}
            required
          />

          <p className="password Sign">here you need to write new pass</p>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setnewPassword(event.target.value)}
            required
          />

          <p className="password Sign">here you need to confirm new pass</p>
          <input
            type="password"
            value={reallyNew}
            onChange={(event) => setReallyNew(event.target.value)}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}
          <button className="button_Sign" type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'change'}
          </button>
        </form>
        {message && <p className="success">{message}</p>}

        {Array.isArray(errors.password) && (
          <ul>
            {errors.password.map((msg) => (
              <li key={msg} className="error">
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default Profile;
