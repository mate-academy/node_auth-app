import { Link } from 'react-router-dom';
import { Card } from '../shared/components/Card';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Card className=" bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Not found page </h2>
        <Link
          to="/"
          className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-4 rounded-xl transition-colors text-sm"
        >
          Back to Main
        </Link>
      </Card>
    </div>
  );
};
