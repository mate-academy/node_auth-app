import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const RegistrationPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5700/auth/registration', formData);
      setMessage('Реєстрація успішна! Перевірте пошту для активації.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Помилка реєстрації');
    }
  };

  return (
    <div className="auth-form-container">
      <h1>Реєстрація</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="field">
          <label>Name</label>
          <input
          type="text"
          placeholder="Ім'я"
          onChange={e => setFormData({...formData, name: e.target.value})}
          required
        />
        </div>

        <div className="field">
          <label>Email</label>
          <input
          type="email"
          placeholder="Email"
          onChange={e => setFormData({...formData, email: e.target.value})}
          required
        />
        </div>



        <div className="field">
          <label>Password</label>
          <input
          type="password"
          placeholder="Пароль"
          onChange={e => setFormData({...formData, password: e.target.value})}
          required
        />
        </div>


        <button type="submit">Зареєструватися</button>
      </form>
      {message && <p>{message}</p>}
      <p>Вже є акаунт? <Link to="/login">Увійти</Link></p>

      <p>
        <Link to="/">Головна</Link>
      </p>
    </div>
  );
};
