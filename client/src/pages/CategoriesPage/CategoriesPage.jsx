import { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import './CategoriesPage.module.scss';
import { AuthContext } from '../../context/AuthContext';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const { isReady, user } = useContext(AuthContext);

  // 1. Завантаження категорій
  useEffect(() => {
    if (!isReady || !user) return;

    // Оголошуємо функцію всередині, щоб уникнути проблем із залежностями
    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');

        // setState викликається ТІЛЬКИ після отримання відповіді (асинхронно)
        setCategories(response.data);
      } catch (err) {
        console.error('Помилка завантаження:', err);
        setError('Не вдалося завантажити категорії');
      }
    };

    loadCategories();
  }, [isReady, user]);

  // 2. Створення категорії
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const response = await api.post('/categories', { name: newName });

      setCategories([...categories, response.data]);
      setNewName('');
    } catch (err) {
      setError('Помилка при створенні');
    }
  };

  // 3. Видалення
  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені? Це може вплинути на пов’язані витрати!'))
      return;

    try {
      await api.delete(`/categories/${id}`);

      setCategories(categories.filter((c) => c.id !== id));
      setError('');
    } catch (err) {
      setError('Не вдалося видалити категорію');
    }
  };

  // 4. Оновлення (редагування)
  const handleUpdate = async (id, updatedName) => {
    try {
      const response = await api.patch(`/categories/${id}`, { name: updatedName });

      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? response.data : cat)),
      );

      setEditingId(null);
      setError('');
    } catch (err) {
      console.error('Помилка при оновленні категорії:', err);
      setError('Помилка при оновленні');
      alert('Не вдалося оновити категорію');
    }
  };

  return (
    <div className="categories-container">
      <h1>Мої категорії</h1>

      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}

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
        {categories.map((category) => (
          <li key={category.id} className="category-item">
            {editingId === category.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button onClick={() => handleUpdate(category.id, editName)}>
                  Зберегти
                </button>
                <button onClick={() => setEditingId(null)}>Скасувати</button>
              </>
            ) : (
              <>
                <span>{category.name}</span>
                <div className="actions">
                  <button
                    onClick={() => {
                      setEditingId(category.id);
                      setEditName(category.name);
                    }}
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="danger"
                  >
                    Видалити
                  </button>
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
