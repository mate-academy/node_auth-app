import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import SignUp from './SignUp';
import LogIn from './LogIn';
import Profile from './Profile';
import Resetpass from './resetpass';
import Activation from './Activation';
import NotFound from './NotFound';
import EmailSend from './Emailsend';
import ResetSuccess from './ResetSuccess';
/*eslint-disable*/

function App() {
  return (
    <>
      <header>
        <div className='this__header'>
          <div className='left_buttons'>
          </div>
          <div className='right_buttons'>
            <Link className='button_sign_up font' to="/sign-up">Sign up</Link>
            <Link className='button_sign_up font' to="/log-in">Log in</Link>
          </div>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/log-in" element={<LogIn />} />
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/activation/:token" element={<Activation />} />
          <Route path="/" element={<SignUp />}></Route>
          <Route path="/forgot-password/:token" element={<Resetpass />}></Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/forgot-password" element={<EmailSend />}></Route>
          <Route path="/reset-success" element={<ResetSuccess />} />
        </Routes>
      </main>

    </>
  )
}

export default App
