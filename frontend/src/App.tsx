import './assets/styles/App.css';
import Header from './components/Header';
import Main from './components/Main';
import { UserProvider } from './features/user/UserProvider';

function App() {
  return (
    <UserProvider>
      <Header />
      <Main />
    </UserProvider>
  );
}

export default App;
