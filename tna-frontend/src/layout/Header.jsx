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
            <div className="user-avatar-small">S</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
