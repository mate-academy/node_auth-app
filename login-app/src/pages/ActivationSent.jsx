import { Link } from 'react-router-dom';

export const ActivationSent = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-4-desktop is-6-tablet">
            <div className="box has-text-centered p-5">
              <h2 className="title is-4 has-text-link mb-4">
                Check Your Email
              </h2>

              <p className="has-text-grey mb-5" style={{ lineHeight: '1.5' }}>
                An activation link has been sent to your email address. Please
                check your inbox and click the link to confirm your account.
              </p>

              <hr />

              <div className="is-size-7">
                <Link to="/login" className="has-text-link">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
