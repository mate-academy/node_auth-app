import { AuthCard } from "../../components/AuthCard";

export const RegisterPage = () => {
  return (
    <AuthCard title="Create account" subtitle="Join the galaxy">
      <form>
        <div>
          <div className="field">
            <label className="label" htmlFor="name">Name</label>
            <div className="control">
              <input id="name" className="input" type="text" placeholder="Name" required />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <div className="control">
              <input className="input" type="email" placeholder="Email" id="email" required />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <div className="control">
              <input className="input" type="password" placeholder="Password" id="password" required minLength={6}/>
            </div>
            <p className="help">At least 6 characters</p>
          </div>

          <button className="button is-link is-fullwidth" type="submit">Sign up</button>
        </div>
      </form>
    </AuthCard>
  );
};
