import { Link, useLocation } from 'react-router-dom';

export default function CheckEmailPage() {
  const { state } = useLocation();
  const email = state?.email;

  return (
    <section className="card">
      <h1>Перевірте пошту</h1>
      <p>
        Ми надіслали лист для активації акаунта
        {email ? <> на <strong>{email}</strong></> : null}. Перейдіть за
        посиланням у листі, щоб завершити реєстрацію.
      </p>
      <p className="card__footer">
        Активували акаунт? <Link to="/login">Увійти</Link>
      </p>
    </section>
  );
}
