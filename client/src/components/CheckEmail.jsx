export const CheckEmail = ({
  description = 'We have sent you an email with the activation link',
}) => (
  <section className="">
    <h1 className="title">Check your email</h1>
    <p>{description}</p>
  </section>
);
