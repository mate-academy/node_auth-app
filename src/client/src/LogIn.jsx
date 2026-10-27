import { useState } from 'react';
/*eslint-disable*/
import { Link, useNavigate } from 'react-router-dom';
import '../src/style/SignIn.css';
import { Loader } from '../src/Loader/Loader';

const API_URL = 'http://localhost:3000';

function LogIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  function HandleSubmit(event) {
    event.preventDefault();

    setErrors('');
    setIsLoading(true);

    fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    .then(async (response) =>{
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      // беремо наший токен, він зберігається в браузері і потім його можна використати
      // в файлі profile
      navigate('/profile');
    })
      .catch(() => setErrors('Server is not available'))
      .finally(() => {setIsLoading(false); setEmail(''); setPassword('');});
  }

  return(
    <>
      <div className="SignUp_page">
        <form onSubmit={HandleSubmit}>
        <p className="Name Sign">Email</p>
        <input
          type="text"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {errors.name && <p className="error">{errors.name}</p>}

        <p className="password">Password</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {errors && <p className="error">{errors}</p>}

        <button className="button_Sign" type="submit" disabled={isLoading}>
          {isLoading ? <Loader /> : `Log in`}
        </button>

        <div>
          <p>Haven't any account? please Sign in</p>
           <Link to="/sign-up">Sign up</Link>
          <p>Forgot the password?</p>
           <Link to="/forgot-password">here the link to make new one</Link>
        </div>
        </form>
      </div>
    </>
  );
};

export default LogIn;
