import { useContext, useState } from "react";
import { UserContext } from "../../../context/UserContext";
import { AlertCircle } from "lucide-react";

export const SecurityTab = () => {
  const { updatePassword } = useContext(UserContext);

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <form
      className="profile-form"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await updatePassword(password, newPassword);
        } catch (error) {
          setErrorMessage(error.response?.data?.message);
        }
      }}
    >
      <div className="profile-form__group">
        <label>Current Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="profile-form__row">
        <div className="profile-form__group">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="profile-form__group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmNewPass}
            onChange={(e) => setConfirmNewPass(e.target.value)}
          />
        </div>
      </div>
      <button className="profile-form__submit-button" type="submit" disabled={newPassword !== confirmNewPass}>Update Password</button>
      {errorMessage && (
        <div className="profile-form__error-message">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}
    </form>
  );
}