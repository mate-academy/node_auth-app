import { Link } from 'react-router-dom';
import PageCard from '../components/PageCard.jsx';

export default function PasswordResetSuccess() {
  return (
    <PageCard title="Пароль оновлено" subtitle="Ви можете увійти з новим паролем.">
      <div className="space-y-4 text-sm text-slate-700">
        <p>Пароль успішно змінено. Якщо цього не робили ви — змініть пароль ще раз та зверніться в підтримку.</p>
        <Link className="btn-primary w-full sm:w-auto" to="/login">
          До входу
        </Link>
      </div>
    </PageCard>
  );
}
