import { Link } from 'react-router-dom';
import PageCard from '../components/PageCard.jsx';

export default function ResetPasswordEmailSent() {
  return (
    <PageCard
      title="Лист надіслано"
      subtitle="Якщо email існує в системі, ми відправили інструкцію з відновлення."
    >
      <div className="space-y-4 text-sm text-slate-700">
        <p>Перевірте вхідні та папку «Спам». Лист може надійти з невеликою затримкою.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link className="btn-primary w-full sm:w-auto" to="/reset-password">
            Ввести інший email
          </Link>
          <Link className="btn-secondary w-full sm:w-auto" to="/login">
            Повернутися до входу
          </Link>
        </div>
      </div>
    </PageCard>
  );
}
