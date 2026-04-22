import { PasswordResetRequestForm } from '../PasswordResetRequestForm';
import { useGuestOnly } from '../useGuestOnly';

export function ResetPasswordRequestPage() {
  const isCheckingAuth = useGuestOnly();

  if (isCheckingAuth) {
    return null;
  }

  return <PasswordResetRequestForm />;
}
