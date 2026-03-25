import './App.css';
import { Outlet } from 'react-router-dom';

function App() {

  return (
    <main className="section">
      <Outlet />
    </main>
  );
}

export default App;
