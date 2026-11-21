import { useState } from "react";
import { AuthCard } from "../../components/AuthCard";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isPasswordLong = password.length >= 6;

  return (
    <AuthCard title="Create account" subtitle="Join the galaxy">
      <form>
        <div>
          <div className="field">
            <label className="label" htmlFor="name">
              Name
            </label>
            <div className="control">
              <input
                id="name"
                autoComplete="name"
                className="input"
                type="text"
                placeholder="Name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <div className="control">
              <input
                className="input"
                type="email"
                autoComplete="email"
                placeholder="Email"
                id="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className="control">
              <input
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="Password"
                id="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {isPasswordLong ? (
              <p className="help is-success">At least 6 characters</p>
            ) : (
              <p className="help">At least 6 characters</p>
            )}
          </div>

          <button className="button is-link is-fullwidth" type="submit">
            Sign up
          </button>
        </div>
      </form>
    </AuthCard>
  );
};
