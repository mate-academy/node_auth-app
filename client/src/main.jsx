import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Root } from './Root'; // Обов'язково у фігурних дужках!
import './index.css';
import { AuthProvider } from './context/AuthProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
);
