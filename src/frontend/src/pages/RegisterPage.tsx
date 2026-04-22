import { RegisterForm } from '../RegisterForm';
import { useGuestOnly } from '../useGuestOnly';

export function RegisterPage() {
  const isCheckingAuth = useGuestOnly();

  if (isCheckingAuth) {
    return null;
  }

  return <RegisterForm />;
}
