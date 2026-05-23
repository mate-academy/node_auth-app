import { CircleUserRound } from 'lucide-react';
import type { ProfileUser } from '../../../types/User';
import { useContext, useState } from 'react';
import { changeName } from '../../../api/profile';
import { AuthContext } from '../../../context/AuthContext';

type Props = {
  user: ProfileUser;
};

export const ProfileInfo: React.FC<Props> = ({ user }) => {
  const [nameForm, setNameForm] = useState(false);
  const [name, setName] = useState(user.name);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const { setUser } = useContext(AuthContext);

  const handleSaveName = async (event: React.SubmitEvent) => {
    event.preventDefault();

    setError('');
    if (name === user.name) {
      setError('New name must be different from the current one');
      return;
    }
    try {
      const user = await changeName(name);
      setUser(user);
      setToast('Name changed successfully!');
      setNameForm(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="profile-information">
      <h3>Profile information</h3>
      <div className="profile-container">
        <div className="profile-image">
          <CircleUserRound size={80} />
        </div>
        <div className="profile-values">
          <div className="profile-name-container">
            <span className="profile-text">Name</span>
            <div className="profile-text-container">
              {nameForm ? (
                <form
                  onSubmit={handleSaveName}
                  id="profile-form"
                  className="profile-form"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input profile-input"
                  />
                </form>
              ) : (
                <span>
                  <strong>{user.name}</strong>
                </span>
              )}
              {nameForm ? (
                <div className="profile-buttons">
                  <button
                    className="form-button"
                    type="submit"
                    form="profile-form"
                  >
                    Save
                  </button>
                  <button
                    className="form-button"
                    onClick={() => {
                      setNameForm(false);
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="form-button profile-button-name"
                  onClick={() => setNameForm((prev) => !prev)}
                >
                  Change
                </button>
              )}
            </div>
            {error && <p className="notification">{error}</p>}
            {toast && <p className="notification-success">{toast}</p>}
          </div>
          <span className="profile-text">Email</span>
          <span>
            <strong>{user.email}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
