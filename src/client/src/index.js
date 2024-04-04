import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import './index.css';
import { App } from './App';
import { Provider } from './Context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Provider>
      <App />
    </Provider>
  </Router>
);

//reportWebVitals();
