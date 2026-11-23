import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChangePasswordForm from '../components/ChangePasswordForm';

export default function ProfilePage() {
  const { user, updateName } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const startEditing = () => {
    setName(user.name);
    setError('');
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) {
      setError('Name is required');
      return;
    }

    if (trimmed === user.name) {
      setIsEditing(false);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await updateName(trimmed);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Profile</h1>

      {isEditing ? (
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              autoFocus
              required
            />
          </label>

          {error && <p className="form__error">{error}</p>}

          <button className="btn btn--primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setIsEditing(false)}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button className="btn btn--primary" onClick={startEditing}>
            Edit name
          </button>
        </>
      )}

      <ChangePasswordForm />
    </section>
  );
}
