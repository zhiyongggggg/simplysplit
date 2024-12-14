import './Settings.css';

import Sidebar from './Sidebar';

import { useState } from 'react';
import { useAppNavigation } from './navigation';

function Settings() {
  const [users, setUsers] = useState([]); // State to store users
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Toggle state for the menu

  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout } = useAppNavigation();

  // Function to toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  return (
    <div className="settings">
      <div className="header">
        {/* Hamburger Menu on the left */}
        <div className="hamburger" onClick={toggleMenu}>
          &#9776;
        </div>
        <h1>SimplySplit</h1>
      </div>
      <hr className="divider" />

      {/* Import the Sidebar component and pass the necessary props */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        handleHome={handleHome}
        handleJoinGroup={handleJoinGroup}
        handleCreateGroup={handleCreateGroup}
        handleSettings={handleSettings}
        handleLogout={handleLogout}
      />

      <div className="body">
        <div className="userlist">
          LAZY DO LOL.
        </div>
      </div>
    </div>
  );
}

export default Settings;
