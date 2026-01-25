import { Link } from 'react-router-dom';

export default function ResetSuccess() {
  return (
    <>
      <h2>Password update successfully</h2>
      <p>You can now login with your new password.</p>

      <Link to='/login'>Go to login</Link>
    </>
  );
}
