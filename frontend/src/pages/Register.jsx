import { useState } from 'react';
import { isValidPassword, PasswordRules } from '../components/PasswordRules.jsx';
import { api } from '../api/api.js';
import { Link } from 'react-router-dom';

export default function Register() {
  const [nameRegister, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isValidPassword(password)) {
      setError('Password does not meet requirements');
    }

    if (password !== confirmation) {
      setError('The passwords do not match');
    }

    try {
      await api.post('/auth/register', {
        nameRegister,
        email,
        password,
      });
      setSuccess(true);
    } catch {
      setError('Error registering');
    }
  }

  if (success) {
    return (
      <>
        <h2>Registration complete</h2>
        <p>Check your email to activate your account</p>
        <Link to="/login">Go to login</Link>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Cadastro</h2>

      {error && <p>{error}</p>}

      <input
        placeholder="Nome"
        value={nameRegister}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <PasswordRules password={password} />

      <input
        type="password"
        placeholder="Confirm password"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        required
      />

      <button type="submit">Register</button>

      <p>
        Já tem conta? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}
