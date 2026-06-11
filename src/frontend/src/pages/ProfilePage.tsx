import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/user";

export function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNameError("");
    setNameSuccess("");
    try {
      await userApi.updateName(name);
      setUser({ ...user!, name });
      setNameSuccess("Name updated successfully");
    } catch (err: any) {
      setNameError(err.response?.data?.error || "Something went wrong");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) return setPasswordError("Passwords do not match");
    if (newPassword.length < 8) return setPasswordError("Password must be at least 8 characters");
    try {
      await userApi.updatePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password updated successfully");
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || "Something went wrong");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");
    try {
      await userApi.updateEmail(newEmail, emailPassword);
      setUser({ ...user!, email: newEmail });
      setNewEmail("");
      setEmailPassword("");
      setEmailSuccess("Email updated successfully");
    } catch (err: any) {
      setEmailError(err.response?.data?.error || "Something went wrong");
    }
  };

  const inputCls = "bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full";
  const btnCls = "bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition";

  return (
    <div className="min-h-screen bg-zinc-900 flex justify-center py-10 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">

        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-zinc-400 text-sm mt-1">{user?.email}</p>
            <p className="text-zinc-400 text-sm">{user?.name || "No name set"}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition text-sm">
            Logout
          </button>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-xl flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-zinc-200">Change Name</h2>
          <form onSubmit={handleNameSubmit} className="flex flex-col gap-3">
            {nameError && <p className="text-red-400 text-sm">{nameError}</p>}
            {nameSuccess && <p className="text-green-400 text-sm">{nameSuccess}</p>}
            <input type="text" placeholder="New name" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
            <button type="submit" className={btnCls}>Update Name</button>
          </form>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-xl flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-zinc-200">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-400 text-sm">{passwordSuccess}</p>}
            <input type="password" placeholder="Current password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className={inputCls} />
            <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputCls} />
            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputCls} />
            <button type="submit" className={btnCls}>Update Password</button>
          </form>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-xl flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-zinc-200">Change Email</h2>
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
            {emailSuccess && <p className="text-green-400 text-sm">{emailSuccess}</p>}
            <input type="email" placeholder="New email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className={inputCls} />
            <input type="password" placeholder="Your current password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required className={inputCls} />
            <button type="submit" className={btnCls}>Update Email</button>
          </form>
        </div>

      </div>
    </div>
  );
}
