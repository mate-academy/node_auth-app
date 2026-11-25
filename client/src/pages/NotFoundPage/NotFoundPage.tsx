import { Link } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';

export const NotFoundPage = () => {
  return (
    <AuthCard title="404 🛸" subtitle="Lost in space? This page doesn't exist">
      <p className="has-text-centered">
        <Link to="/">← Back to Earth</Link>
      </p>
    </AuthCard>
  );
};
