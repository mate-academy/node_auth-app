import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CustomSelect, { CustomSelectOption } from '../../components/CustomSelect/CustomSelect';
import { Modal } from '../../components/Modal/Modal';
import styles from './ExpensesPage.module.scss';

interface Category {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  title: string;
  amount: number;
  spentAt: string;
  categoryId: number;
  category?: Category;
}

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Фільтри
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<number | 'all'>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

  // Стан форми створення
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    categoryId: 0,
    spentAt: new Date().toISOString().split('T')[0],
  });

  // Стан для модалки швидкого створення категорії
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Завантаження даних
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, catRes] = await Promise.all([
          axios.get('http://localhost:5700/expenses'),
          axios.get('http://localhost:5700/categories'),
        ]);
        setExpenses(expRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // ЛОГІКА ФІЛЬТРАЦІЇ (Клієнтська)
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // 1. Пошук за назвою
      const matchesSearch = exp.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 2. Фільтр за категорією
      const matchesCategory =
        selectedCatId === 'all' || exp.categoryId === selectedCatId;

      // 3. Фільтр за датою
      const expDate = new Date(exp.spentAt).getTime();
      const fromDate = dateRange.from
        ? new Date(dateRange.from).getTime()
        : -Infinity;
      const toDate = dateRange.to ? new Date(dateRange.to).getTime() : Infinity;
      const matchesDate = expDate >= fromDate && expDate <= toDate;

      // 4. Фільтр за сумою
      const matchesAmount =
        (amountRange.min === '' || exp.amount >= Number(amountRange.min)) &&
        (amountRange.max === '' || exp.amount <= Number(amountRange.max));

      return matchesSearch && matchesCategory && matchesDate && matchesAmount;
    });
  }, [expenses, categories, searchQuery, selectedCatId, dateRange, amountRange]);

  const catOptionsForFilter = useMemo(() => [
    { value: 'all', label: 'Всі категорії' } as const,
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ], [categories]) as CustomSelectOption<number | "all">[];

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCatId('all');
    setDateRange({ from: '', to: '' });
    setAmountRange({ min: '', max: '' });
  };

  // Перетворюємо категорії у формат для CustomSelect
  const categoryOptions = useMemo(
    () => [
      ...categories.map((c) => ({ value: c.id, label: c.name })),
      {
        value: -1,
        label: '+ Додати нову категорію...',
        render: () => (
          <strong style={{ color: '#007bff' }}>+ Додати категорію</strong>
        ),
      },
    ],
    [categories],
  );

  // Обробник вибору в селекті
  const handleCategoryChange = (val: number) => {
    if (val === -1) {
      setIsCatModalOpen(true);
    } else {
      setNewExpense({ ...newExpense, categoryId: val });
    }
  };

  // Створення витрати
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.categoryId) return alert('Оберіть категорію');

    try {
      const res = await axios.post('http://localhost:5700/expenses', {
        ...newExpense,
        amount: Number(newExpense.amount),
      });

      const createdExpense = res.data;

      // setExpenses([res.data, ...expenses]);
      setExpenses(prev => [createdExpense, ...prev]);
      setNewExpense({ ...newExpense, title: '', amount: '' }); // очищаємо поля
    } catch (err) {
      alert('Помилка при збереженні');
    }
  };

  // Швидке створення категорії через модалку
  const handleQuickCreateCategory = async () => {
    if (!newCatName.trim()) return;

    try {
      const res = await axios.post('http://localhost:5700/categories', {
        name: newCatName,
      });
      setCategories([...categories, res.data]);
      setNewExpense({ ...newExpense, categoryId: res.data.id });
      setNewCatName('');
      setIsCatModalOpen(false);
    } catch (err) {
      alert('Помилка створення категорії');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Мої Витрати</h1>

      {/* ШВИДКА ФОРМА СТВОРЕННЯ */}
      <section className={styles.quickFormCard}>
        <form onSubmit={handleAddExpense} className={styles.inlineForm}>
          <input
            type="text"
            placeholder="Що купили?"
            value={newExpense.title}
            onChange={(e) =>
              setNewExpense({ ...newExpense, title: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Сума"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: e.target.value })
            }
            required
          />
          <div className={styles.selectWrapper}>
            <CustomSelect
              options={categoryOptions}
              currentValue={newExpense.categoryId}
              onChange={handleCategoryChange}
              placeholder="Категорія"
            />
          </div>
          <input
            type="date"
            value={newExpense.spentAt}
            onChange={(e) =>
              setNewExpense({ ...newExpense, spentAt: e.target.value })
            }
          />
          <button type="submit">Додати</button>
        </form>
      </section>

      {/* ПАНЕЛЬ ФІЛЬТРІВ */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Пошук за назвою..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className={styles.filterGroup}>
          <label>Від:</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange({ ...dateRange, from: e.target.value })
            }
          />
          <label>До:</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>

        <div className={styles.filterGroup}>
          <input
            type="number"
            placeholder="Мін грн"
            value={amountRange.min}
            onChange={(e) =>
              setAmountRange({ ...amountRange, min: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Макс грн"
            value={amountRange.max}
            onChange={(e) =>
              setAmountRange({ ...amountRange, max: e.target.value })
            }
          />
        </div>

        <div className={styles.selectSmall}>
          <CustomSelect
            options={catOptionsForFilter}
            currentValue={selectedCatId}
            onChange={(val) => setSelectedCatId(val as number | 'all')}
          />
        </div>

        <button className={styles.resetBtn} onClick={resetFilters}>
          Очистити фільтри
        </button>
      </div>

      {/* ТАБЛИЦЯ ТА ПІДСУМОК */}
      <div className={styles.stats}>
        Знайдено: <strong>{filteredExpenses.length}</strong> записів | Сума:{' '}
        <strong>
          {filteredExpenses
            .reduce((acc, curr) => acc + curr.amount, 0)
            .toFixed(2)}{' '}
          грн
        </strong>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Назва</th>
            <th>Категорія</th>
            <th>Сума</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((exp) => (
            <tr key={exp.id}>
              <td>{new Date(exp.spentAt).toLocaleDateString()}</td>
              <td>{exp.title}</td>
              <td>{exp.category?.name}</td>
              <td className={styles.amountCell}>{exp.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ТАБЛИЦЯ ВИТРАТ */}
      {/* <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Опис</th>
              <th>Категорія</th>
              <th>Сума</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td>{new Date(exp.spentAt).toLocaleDateString()}</td>
                <td>{exp.title}</td>
                <td>
                  <span className={styles.badge}>
                    {exp.category?.name || 'Без категорії'}
                  </span>
                </td>
                <td className={styles.amount}>{exp.amount.toFixed(2)} грн</td>
                <td>
                  <button className={styles.deleteBtn}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      {/* МОДАЛКА ДЛЯ ШВИДКОЇ КАТЕГОРІЇ */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onConfirm={handleQuickCreateCategory}
        title="Швидке створення категорії"
        message="Введіть назву для нової категорії витрат:"
        confirmText="Створити"
        cancelText="Скасувати"
      >
        <div style={{ marginTop: '15px' }}>
          <label
            style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}
          >
            Назва категорії:
          </label>
          <input
            type="text"
            autoFocus
            placeholder="Наприклад: Гігієна"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQuickCreateCategory();
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
