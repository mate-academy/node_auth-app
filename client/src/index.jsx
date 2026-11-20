import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';

import App from './App';
import { ProfileProvider } from './components/ProfileContext';

const root = createRoot(document.getElementById('root'));

root.render(
  <AuthProvider>
    <ProfileProvider>
      <Router>
        <App />
      </Router>
    </ProfileProvider>
  </AuthProvider>,
);
