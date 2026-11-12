export const RequireActivation = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="box has-text-centered">
          <span className="icon is-large has-text-success mb-4">
            <i className="fas fa-envelope fa-3x"></i>
          </span>

          <h1 className="title is-3">Check your email</h1>

          <p className="subtitle is-6">
            We have sent you an email with the activation link.
            Please check your inbox and activate your account.
          </p>

          <p className="has-text-grey is-size-7">
            If you don't see the email, check your spam folder.
          </p>
        </div>
      </div>
    </section>
  );
};
