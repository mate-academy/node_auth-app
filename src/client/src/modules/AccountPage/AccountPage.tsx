import { Form } from '../../components/Form/Form';
import { AuthUser } from '../../types/auth';

type Props = {
  initialMode: 'login' | 'registration';
  onLoginSuccess: (user: AuthUser) => void;
};

export const AccountPage = ({ initialMode, onLoginSuccess }: Props) => {
  return (
    <>
      <Form initialMode={initialMode} onLoginSuccess={onLoginSuccess} />
    </>
  );
};
