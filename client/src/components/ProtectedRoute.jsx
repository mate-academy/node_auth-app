'use strict';

import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ isAuthed, children }) {
  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

