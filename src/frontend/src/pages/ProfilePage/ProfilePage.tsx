import { useContext, useState } from 'react';
import { ProfileInfo } from './components/ProfileInfo';
import { AuthContext } from '../../context/AuthContext';
import { ProfileChangePassword } from './components/ProfileChangePassword';
import { ProfileChangeEmail } from './components/ProfileChangeEmail';

type ProfileSection = 'information' | 'changePassword' | 'changeEmail';

export const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] =
    useState<ProfileSection>('information');

  const { user } = useContext(AuthContext);

  return (
    <div className="profile background-white">
      <div className="profile-separator">
        <nav className="profile-nav">
          <span
            className={`profile-nav-link ${activeSection === 'information' ? 'profile-nav-link-active' : ''}`}
            onClick={() => setActiveSection('information')}
          >
            Profile
          </span>
          <span
            className={`profile-nav-link ${activeSection === 'changePassword' ? 'profile-nav-link-active' : ''}`}
            onClick={() => setActiveSection('changePassword')}
          >
            Change password
          </span>
          <span
            className={`profile-nav-link ${activeSection === 'changeEmail' ? 'profile-nav-link-active' : ''}`}
            onClick={() => setActiveSection('changeEmail')}
          >
            Change email
          </span>
        </nav>
        <div className="profile-main">
          {user && activeSection === 'information' && (
            <ProfileInfo user={user} />
          )}
          {user && activeSection === 'changePassword' && (
            <ProfileChangePassword user={user} />
          )}
          {user && activeSection === 'changeEmail' && (
            <ProfileChangeEmail user={user} />
          )}
        </div>
      </div>
    </div>
  );
};
