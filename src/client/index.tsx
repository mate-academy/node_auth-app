import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';

import 'bulma/css/bulma.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './styles/index.scss';

import App from './App';

createRoot(document.getElementById('root') as HTMLDivElement).render(
  <AuthProvider>
    <Router>
      <App />
    </Router>
  </AuthProvider>,
);
