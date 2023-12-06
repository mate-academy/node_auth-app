import { createRoot } from 'react-dom/client';

import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { App } from './App';
import { AuthProvider } from './components/AuthContext';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root') as HTMLDivElement).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);
