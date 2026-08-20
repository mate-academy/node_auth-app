import { useEffect, useRef, useState } from 'react';
import { api } from '../shared/api/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../shared/components';
import { Card } from '../shared/components/Card';

export const ActivationPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useParams<{ token: string }>();
  const hasRequested = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Activation token is missing');
      setIsLoading(false);
      return;
    }

    const activate = async () => {
      if (hasRequested.current === true) {
        return;
      }

      hasRequested.current = true;
      try {
        await api.get(`/auth/activations/${token}`);
        setIsSuccess(true);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            'Failed to activate account. The link may be expired.',
        );
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    activate();
  }, [token]);

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => navigate('/login'), 5000);

    return () => clearTimeout(timer);
  }, [isSuccess, navigate]);

  if (isLoading) {
    return <Loader fullScreen={true} />;
  }

  if (isSuccess) {
    return (
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-2">
          Email has been activated successfully
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Redirecting to login page in 5 seconds...
        </p>
        <Link
          to="/login"
          className="w-full inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
        >
          Go to Login
        </Link>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
      <h2 className="text-xl font-bold text-red-500 mb-2">
        Email activation failed
      </h2>
      <p>{error}</p>
      <Link
        to="/login"
        className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-4 rounded-xl transition-colors text-sm"
      >
        Back to Login
      </Link>
    </Card>
  );
};
