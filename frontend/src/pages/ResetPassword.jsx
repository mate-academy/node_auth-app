import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isValidPassword } from "../components/PasswordRules.jsx";
import { api } from "../api/api.js";

export default function ResetPassword() {
  const [ searchParams ] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password does not meet requirements');
      return;
    }

    if  (password !== confirmation) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      await api.post('/password/reset', {
        token,
        password,
        confirmation,
      });

      navigate('/reset-success');
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password')
    } finally {
      setLoading(false);
    }
    }

 return (
    <form onSubmit={handleSubmit}>
      <h2>Reset password</h2>

      {error && <p>{error}</p>}

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Reset password'}
      </button>
    </form>
  );
}
