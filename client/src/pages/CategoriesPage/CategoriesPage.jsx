import { useState, useEffect } from 'react';
import axios from 'axios';
import './CategoriesPage.module.scss';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  // 1. Завантаження категорій
  useEffect(() => {
    // Оголошуємо функцію всередині, щоб уникнути проблем із залежностями
  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5700/categories');
      // setState викликається ТІЛЬКИ після отримання відповіді (асинхронно)
      setCategories(response.data);
    } catch (err) {
      console.error('Помилка завантаження:', err);
    }
  };

  loadCategories();
  }, []);

  // 2. Створення категорії
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const response = await axios.post('http://localhost:5700/categories', { name: newName });
      setCategories([...categories, response.data]);
      setNewName('');
    } catch (err) {
      setError('Помилка при створенні');
    }
  };

  // 3. Видалення
  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені? Це може вплинути на пов’язані витрати!')) return;

    try {
      await axios.delete(`http://localhost:5700/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      setError('Не вдалося видалити категорію');
    }
  };

  // 4. Оновлення (редагування)
  const handleUpdate = async (id, newName) => {
    try {
      const response = await axios.patch(`http://localhost:5700/categories/${id}`, {
        name: newName,
      });

      setCategories(prev =>
        prev.map(cat => cat.id === id ? response.data : cat)
      );

      setEditingId(null);
    } catch (err) {
      console.error("Помилка при оновленні категорії:", err);
      setError('Помилка при оновленні');
      alert("Не вдалося оновити категорію");
    }
  };

  return (
    <div className="categories-container">
      <h1>Мої категорії</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleCreate} className="category-form">
        <input
          type="text"
          placeholder="Назва нової категорії"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit">Додати</button>
      </form>

      <ul className="categories-list">
        {categories.map(category => (
          <li key={category.id} className="category-item">
            {editingId === category.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button onClick={() => handleUpdate(category.id, editName)}>Зберегти</button>
                <button onClick={() => setEditingId(null)}>Скасувати</button>
              </>
            ) : (
              <>
                <span>{category.name}</span>
                <div className="actions">
                  <button onClick={() => {
                    setEditingId(category.id);
                    setEditName(category.name);
                  }}>Редагувати</button>
                  <button onClick={() => handleDelete(category.id)} className="danger">Видалити</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesPage;
