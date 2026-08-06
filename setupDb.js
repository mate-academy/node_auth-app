import 'dotenv/config';
import { Todo } from './src/api/todos/Todo.model.js';
import { User } from './src/api/users/User.model.js';
import { Expense } from './src/api/expenses/Expense.model.js';
import { Token } from './src/models/token/Token.model.js';

async function setupDb() {
  await Todo.sync({ force: true });
  // eslint-disable-next-line no-console
  console.log(' --- The table for the todos model was just created! --- ');

  await User.sync({ force: true });
  // eslint-disable-next-line no-console
  console.log(' --- The table for the users model was just created! --- ');

  await Expense.sync({ force: true });
  // eslint-disable-next-line no-console
  console.log(' --- The table for the expenses model was just created! --- ');

  await Token.sync({ force: true });
  // eslint-disable-next-line no-console
  console.log(' --- The table for the tokens model was just created! --- ');
}

setupDb().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to setup database:', err.message);
  process.exit(1);
});
