import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './components/AuthContext.tsx';
import {BrowserRouter as Router } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Router>
      <App />
    </Router>
  </AuthProvider>,
);
