import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import { AuthProvider } from './components/AuthContext';
import { App } from './App';

export const Root = () => (
  <AuthProvider>
    <Router>
      <App />
    </Router>
  </AuthProvider>
);

createRoot(document.getElementById('root')!).render(<Root />);
