import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';

import App from './App';

const root = createRoot(document.getElementById('root'));

root.render(
  <AuthProvider>
    <Router>
      <App />
    </Router>
  </AuthProvider>,
);
