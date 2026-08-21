import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user, setUser, logout, token, API_URL } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [pwdData, setPwdData] = useState({
    oldPassword: '',
    newPassword: '',
    confirm: '',
  });

  const updateName = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/profile/update-name`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setUser({ ...user, name });
      alert('Name successfully updated');
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirm)
      return alert('Passwords do not match');

    const res = await fetch(`${API_URL}/profile/update-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: pwdData.oldPassword,
        newPassword: pwdData.newPassword,
      }),
    });
    if (res.ok) alert('Password updated successfully');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2>User Profile: {user?.name}</h2>
      <p>Email: {user?.email}</p>
      <button
        onClick={logout}
        style={{ backgroundColor: 'red', color: 'white' }}
      >
        Log Out
      </button>

      <hr />
      <h3>Change Name</h3>
      <form onSubmit={updateName}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Save</button>
      </form>

      <hr />
      <h3>Change Password</h3>
      <form onSubmit={updatePassword}>
        <input
          type="password"
          placeholder="Old Password"
          required
          onChange={(e) =>
            setPwdData({ ...pwdData, oldPassword: e.target.value })
          }
        />
        <br />
        <input
          type="password"
          placeholder="New Password"
          required
          onChange={(e) =>
            setPwdData({ ...pwdData, newPassword: e.target.value })
          }
        />
        <br />
        <input
          type="password"
          placeholder="Confirm New Password"
          required
          onChange={(e) => setPwdData({ ...pwdData, confirm: e.target.value })}
        />
        <br />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};
