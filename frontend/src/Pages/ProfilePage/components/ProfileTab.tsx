import { AlertCircle, Mail, User } from "lucide-react";
import { useContext, useState } from "react";
import { UserContext } from "../../../context/UserContext";
import { AuthContext } from "../../../context/AuthContext";

export const ProfileTab = () => {
  const { user } = useContext(AuthContext);
  const { updateName } = useContext(UserContext);
  const [name, setName] = useState(user?.name || '');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <form
      className="profile-form"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await updateName(name);
        } catch (error) {
          setErrorMessage(error.response?.data?.message);
        }
      }}
    >
      <div className="profile-form__group">
        <label>Full Name</label>
        <div className="profile-form__input-wrapper">
          <User className="profile-form__input-icon" size={18} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
      </div>
      <div className="profile-form__group">
        <label>Email Address</label>
        <div className="profile-form__input-wrapper profile-form__input-wrapper--disabled">
          <Mail className="profile-form__input-icon" size={18} />
          <input type="email" value={user?.email} disabled />
        </div>
        <p className="profile-form__helper-text">To change your email, go to the "Change Email" tab.</p>
      </div>
      <button
        className="profile-form__submit-button"
        type="submit"
        disabled={name === user?.name}
      >
        Save Changes
      </button>
      {errorMessage && (
        <div className="profile-form__error-message">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}
    </form>
  );
}