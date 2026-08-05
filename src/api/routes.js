import usersRouter from './users/users.route.js';
import expensesRouter from './expenses/expense.route.js';
import todosRouter from './todos/todos.route.js';
import authRouter from './auth/auth.route.js';

export const routes = {
  users: usersRouter,
  expenses: expensesRouter,
  todos: todosRouter,
  auth: authRouter,
};
