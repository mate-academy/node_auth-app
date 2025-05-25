import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './components/AuthContext';
import App from './App';

const Root = () => (
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);

const container = document.getElementById('root');

if (!container) {
  throw new Error("Root container not found. Ensure <div id='root'></div> exists in index.html.");
}

const root = createRoot(container);
root.render(
  <StrictMode>
    <Root />
  </StrictMode>
);
