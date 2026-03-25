import { useState, useEffect } from 'react';
import axios from 'axios';

export const ExpenseForm = ({ isOpen, onClose, onExpenseCreated, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    categoryId: '',
    spentAt: new Date().toISOString().split('T')[0], // Дата сьогодні
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Конвертуємо суму (наприклад, 10.50 -> 1050), якщо ти вирішив зберігати в копійках
      // Або просто передаємо число, як ми налаштували на бекенді (+amount)
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      const response = await axios.post('http://localhost:5700/expenses', dataToSend);

      onExpenseCreated(response.data); // Оновлюємо список у батьківському компоненті
      onClose(); // Закриваємо модалку
      setFormData({ title: '', amount: '', categoryId: '', spentAt: new Date().toISOString().split('T')[0], note: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка при створенні витрати');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    /* Тут використай своє кастомне модальне вікно */
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Додати витрату</h2>
        <form onSubmit={handleSubmit}>

          <div className="field">
            <label>Назва</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Наприклад: Продукти"
            />
          </div>

          <div className="field">
            <label>Сума</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
            />
          </div>

          <div className="field">
            <label>Категорія</label>
            {/* ТУТ ВСТАВ СВІЙ КАСТОМНИЙ СЕЛЕКТ */}
            <select
              required
              value={formData.categoryId}
              onChange={e => setFormData({...formData, categoryId: e.target.value})}
            >
              <option value="">Оберіть категорію</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Дата</label>
            <input
              type="date"
              value={formData.spentAt}
              onChange={e => setFormData({...formData, spentAt: e.target.value})}
            />
          </div>

          <div className="field">
            <label>Нотатка (опціонально)</label>
            <textarea
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>Скасувати</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Збереження...' : 'Додати'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
