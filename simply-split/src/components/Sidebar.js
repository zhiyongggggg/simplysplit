import React from 'react';
import './Sidebar.css'; // You can separate styles for the sidebar here

function Sidebar({ isMenuOpen, toggleMenu, handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout }) {
  return (
    <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
      {/* Close button */}
      <button className="close-btn" onClick={toggleMenu}>
        &times;
      </button>
      <button className="menu-item" onClick={handleHome}>Home</button>
      <button className="menu-item" onClick={handleJoinGroup}>Join Group</button>
      <button className="menu-item" onClick={handleCreateGroup}>Create Group</button>
      <button className="menu-item" onClick={handleSettings}>Settings</button>
      <button className="menu-item" onClick={handleLogout}>Log Out</button>
    </div>
  );
}

export default Sidebar;
