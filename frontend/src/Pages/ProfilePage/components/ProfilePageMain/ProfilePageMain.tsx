import type React from 'react';
import './ProfilePageMain.scss';

type Props = {
  children: React.ReactNode;
  title: string;
}

export const ProfilePageMain: React.FC<Props> = ({ children, title }) => {
  return (
    <div className="profile-page-main">
      <h1 className="profile-page-main__title">{title}</h1>
      {children}
    </div>
  );
}