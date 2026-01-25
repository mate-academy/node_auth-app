import { useState } from 'react';
import { api } from '../api/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post('/password/forgot', { email });
    setSent(true);
  }

  if (sent) {
    return <p>If the email exists, we will send a link.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>I forgot my password</h2>

      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send</button>
    </form>
  );
}
