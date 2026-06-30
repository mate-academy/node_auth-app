import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

// Імпортуємо наш Redux Store
import { store } from './store';

import './index.css';
import { App } from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Огортаємо весь додаток у Provider, щоб роздати стан */}
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </StrictMode>
);
