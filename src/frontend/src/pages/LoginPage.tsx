import { useSearchParams } from 'react-router-dom';
import { LoginForm } from '../LoginForm';
import { useGuestOnly } from '../useGuestOnly';

export function LoginPage() {
  const isCheckingAuth = useGuestOnly();
  const [searchParams] = useSearchParams();

  if (isCheckingAuth) {
    return null;
  }

  return <LoginForm initialMessage={searchParams.get('error')} />;
}
