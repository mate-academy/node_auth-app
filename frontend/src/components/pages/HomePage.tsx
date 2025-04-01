import { useContext } from 'react';
import '../../assets/styles/App.css';
import { UserContext } from '../../features/user/UserContext';

const HomePage = () => {
  const { user } = useContext(UserContext);
  return (
    <>
      <h2 className="text-2xl font-semibold pt-5">{`Hello, ${
        user ? user.name : 'guest'
      }!`}</h2>
      <div className="perspective-[600px] flex justify-center items-center h-[80vh] bg-[#333]">
        <div className="w-[200px] h-[200px] logo-spin">
          {' '}
          {/* logo-spin is a class from App.css */}
          <img
            className="w-full h-full object-contain"
            src="https://nodejs.org/static/images/logo.svg"
            alt="Spinning Node.js Logo"
          />
        </div>
      </div>
    </>
  );
};

export default HomePage;
