import { Link } from 'react-router-dom';

export const ResetSuccess = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-4-desktop is-6-tablet">
            <div className="box has-text-centered p-5">
              <h2 className="title is-4 has-text-success mb-4">
                Password Changed!
              </h2>

              <p className="has-text-grey mb-5">
                Your password has been successfully updated. You can now log in
                using your new credentials.
              </p>

              <div>
                <Link to="/login" className="button is-link is-fullwidth">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
