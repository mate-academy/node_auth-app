import { AlertCircle, ShieldCheck, CheckCircle } from "lucide-react";
import { useContext, useState } from "react";
import { UserContext } from "../../../context/UserContext";
import { AuthContext } from "../../../context/AuthContext";

export const EmailTab = () => {
  const { setUser } = useContext(AuthContext);
  const { updateEmail } = useContext(UserContext);
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [serverResponse, setServerResponse] = useState('');

  return (
    <form
      className="profile-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setServerResponse('');

        if (!newEmail || !confirmEmail || !password) {
          setErrorMessage("All fields are required.");
          return;
        }

        if (newEmail !== confirmEmail) {
          setErrorMessage("Emails do not match.");
          return;
        }

        try {
          const response = await updateEmail(newEmail, password);
          setServerResponse(response.message);
          setUser(response.user);
          // checkAuth();
        } catch (error) {
          setErrorMessage(error.response?.data?.message);
        }
      }}
    >
      <div className="profile-form__info-box">
        <ShieldCheck size={20} />
        <span>We will send a confirmation link to your new email address.</span>
      </div>
      <div className="profile-form__group">
        <label>New Email Address</label>
        <input
          type="email"
          value={newEmail}
          placeholder="new-email@example.com"
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
      </div>
      <div className="profile-form__group">
        <label>Confirm New Email</label>
        <input
          type="email"
          value={confirmEmail}
          placeholder="Confirm new email"
          onChange={(e) => setConfirmEmail(e.target.value)}
          required
        />
      </div>
      <div className="profile-form__group">
        <label>Confirm with Password</label>
        <input
          type="password"
          value={password}
          placeholder="Enter current password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button
        className="profile-form__submit-button"
        type="submit"
        disabled={!newEmail || !confirmEmail || !password || newEmail !== confirmEmail}
      >
        Request Email Change
      </button>
      {serverResponse && (
        <div className="profile-form__success-message">
          <CheckCircle size={18} />
          <span>{serverResponse}</span>
        </div>
      )}
      {errorMessage && (
        <div className="profile-form__error-message">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}
    </form>
  );
}