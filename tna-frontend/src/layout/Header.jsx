import React from 'react';
import './Header.css';

const Header = ({ pageTitle }) => {
  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="page-title">{pageTitle}</h1>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <div className="language-selector">
            <select className="lang-select">
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
          </div>
          <div className="notification-bell">
            <span className="bell-icon">🔔</span>
            <span className="notification-badge">3</span>
          </div>
          <div className="user-profile-mini">
            <div className="user-name">Super Admin</div>
            <img src="/userAvatar.jpeg" alt="User Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
