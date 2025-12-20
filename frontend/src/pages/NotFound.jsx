import { Link } from 'react-router-dom';
import PageCard from '../components/PageCard.jsx';

export default function NotFound() {
  return (
    <PageCard title="404" subtitle="Сторінку не знайдено.">
      <div className="space-y-4 text-sm text-slate-700">
        <p>Можливо, ви ввели адресу з помилкою або сторінка більше не існує.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Link className="btn-primary w-full sm:w-auto" to="/login">
            До входу
          </Link>
          <Link className="btn-secondary w-full sm:w-auto" to="/register">
            Створити акаунт
          </Link>
        </div>
      </div>
    </PageCard>
  );
}
