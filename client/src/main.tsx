import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './modules/shared/store/AuthProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* <HashRouter> */}
      <AuthProvider>
        <App />
      </AuthProvider>
      {/* </HashRouter> */}
    </BrowserRouter>
  </StrictMode>,
);
