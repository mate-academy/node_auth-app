import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <section className="card">
      <h1>Profile</h1>
      <p>
        <strong>Name</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
    </section>
  );
}
