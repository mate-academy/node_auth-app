import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Context } from './Context';
import { Header } from './Header';
import { Login } from './Login';
import { Registration } from './Registration';
import { Verify } from './Verify';
import { Reset } from './Reset';
import { Activation } from './Activation';
import { Profile } from './Profile';
import { UserList } from './UserList';
import { Rename } from './Rename';
import { ChangeEmail } from './ChangeEmail';
import { ChangePassword } from './ChangePassword';
import { Error } from './Error';

export const RoutesProvider = () => {
  const { logedUser, resetingUser, refreshError } = useContext(Context);

  return (
    <Routes>
      <Route
        path="/"
        element={!logedUser
          ? <Header />
          : <Navigate to={`/profile/${logedUser.id}`} replace={true} />}
      >
        <Route
          path="login"
          element={<Login />}
        />

        <Route
          path="registration"
          element={<Registration />}
        />

        <Route
          path="activate/:id"
          element={<Activation />}
        />

        <Route
          path="verify"
          element={<Verify />}
        />

        <Route
          path={resetingUser ? `reset/${resetingUser.id}` : 'reset/:id'}
          element={resetingUser
            ? <Reset />
            : <Navigate to="/verify" replace={true} />}
        />
      </Route>

      <Route
        path={logedUser ? `/profile/${logedUser.id}` : '/profile/:id'}
        element={logedUser
          ? <Profile />
          : refreshError ? (
            <Navigate to="/login+error" replace={true} />
          ) : (
            <Navigate to="/login" replace={true} />
          )}
      >
        <Route
          path="users"
          element={<UserList />}
        />

        <Route
          path="rename"
          element={<Rename />}
        />

        <Route
          path="change+email"
          element={<ChangeEmail />}
        />

        <Route
          path="change+password"
          element={<ChangePassword />}
        />
      </Route>
      
      {refreshError && (
        <Route
          path="/login+error"
          element={<Error errorMessage="Oops, login time out :(" />}
        />
      )}

      <Route
        path="/error"
        element={<Error />}
      />

      <Route
        path="*"
        element={<Navigate to="/error" replace={true} />}
      />
    </Routes>
  )
};
