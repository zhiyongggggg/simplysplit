import './LoggedIn.css';
import { useState } from 'react';
import { useAppNavigation } from './navigation';
import Sidebar from './Sidebar';

function Settings() {
  const [users, setUsers] = useState([]); // State to store users
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Toggle state for the menu

  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout } = useAppNavigation();

  // Function to toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  return (
    <div className="app">
      <div className="header">
        <h1>SimplySplit</h1>
        <p>Log your group expenses here!</p>
        {/* Hamburger Menu on the left */}
        <div className="hamburger" onClick={toggleMenu}>
          &#9776;
        </div>
      </div>

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
          {users.map((user) => (
            <button key={user.username} className="user">
              <h2>{user.username}</h2> 
            </button>
          ))}
          <button className="settings-btn">
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
