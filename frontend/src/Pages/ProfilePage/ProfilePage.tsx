import React, { useContext, useState, } from 'react';
import { User, Lock, Mail, LogOut } from 'lucide-react';
import './ProfilePage.scss';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ProfilePageMain } from './components/ProfilePageMain';
import { ProfileTab } from './components/ProfileTab';
import { SecurityTab } from './components/SecurityTab';
import { EmailTab } from './components/EmailTab';

type ProfileTab = 'details' | 'security' | 'email';

const BASE_PATHNAME = '/profile';

const titles = {
  details: 'Personal information',
  security: 'Change password',
  email: 'Changing your email address',
}

export const ProfilePage: React.FC = () => {
  const { item } = useParams<{ item: ProfileTab }>();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <section className='profile-page'>
      <div className='profile-page__sidebar'>
        <button
          onClick={() => navigate(`${BASE_PATHNAME}/details`)}
          className={`profile-page__sidebar-button ${item === 'details' ? 'profile-page__sidebar-button--active' : ''}`}
        >
          <User size={20} />
          Profile
        </button>
        <button
          onClick={() => navigate(`${BASE_PATHNAME}/security`)}
          className={`profile-page__sidebar-button ${item === 'security' ? 'profile-page__sidebar-button--active' : ''}`}
        >
          <Lock size={20} />
          Security
        </button>
        <button
          onClick={() => navigate(`${BASE_PATHNAME}/email`)}
          className={`profile-page__sidebar-button ${item === 'email' ? 'profile-page__sidebar-button--active' : ''}`}
        >
          <Mail size={20} />
          Change Email
        </button>

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="profile-page__sidebar-button profile-page__sidebar-button--logout"
        >
          <LogOut size={20} />
          Log out
        </button>
      </div>

      <ProfilePageMain title={item ? titles[item] : 'Profile Settings'}>

        {/* DETAILS TAB */}
        {item === 'details' && (
          <ProfileTab />
        )}

        {/* SECURITY TAB */}
        {item === 'security' && (
          <SecurityTab />
        )}

        {/* EMAIL TAB */}
        {item === 'email' && (
          <EmailTab />
        )}
      </ProfilePageMain>

      {isLogoutModalOpen && (
        <div className="modal">
          <div className="modal__content">
            <h3 className="modal__title">Confirm Logout</h3>
            <p className="modal__text">Are you sure you want to log out?</p>
            <div className="modal__actions">
              <button onClick={() => setIsLogoutModalOpen(false)} className="modal__button modal__button--cancel">Cancel</button>
              <button onClick={() => {
                logout().then(() => navigate('/login'))
              }}
                className="modal__button modal__button--confirm">
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};