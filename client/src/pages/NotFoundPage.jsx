import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AuthContext } from '../components/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';

export const NotFoundPage = () => (
  <div>
    <h1> 404: Page is not found</h1>
  </div>
);
