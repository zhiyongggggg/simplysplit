import './Home.css';
import { useState } from 'react';

function Home() {
  const [users, setUsers] = useState([]); // State to store users
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Toggle state for the menu

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

      {/* Slide-out menu */}
      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        {/* Close button */}
        <button className="close-btn" onClick={toggleMenu}>
          &times;
        </button>
        <button className="menu-item">Join Group</button>
        <button className="menu-item">Log Out</button>
      </div>

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

export default Home;
