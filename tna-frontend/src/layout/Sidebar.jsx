import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activePage, setActivePage, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'requests', label: 'Training Requests', icon: '📝' },
    { id: 'assessments', label: 'Assessments', icon: '🎯' },
    { id: 'tna', label: 'TNA Engine', icon: '⚙️' },
    { id: 'programs', label: 'Training Programs', icon: '🎓' },
    { id: 'compliance', label: 'Compliance', icon: '📜' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">NIC</div>
        <div className="logo-text">TNA System</div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">S</div>
          <div className="user-details">
            <div className="user-name">Super Admin</div>
            <div className="user-role">System Administrator</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
