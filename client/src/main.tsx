import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bulma/css/bulma.min.css';
import './index.scss';
import { App } from './App.tsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </StrictMode>,
);
