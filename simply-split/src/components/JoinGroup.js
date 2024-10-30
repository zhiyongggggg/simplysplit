import './LoggedIn.css';
import { useState } from 'react';
import { useAppNavigation } from './navigation';
import Sidebar from './Sidebar';

function JoinGroup() {
  const [users, setUsers] = useState([]); // State to store users
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Toggle state for the menu
  const [groupName, setGroupName] = useState(''); // State to store the group name
  const [groups, setGroups] = useState([]); // State to store found groups

  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout } = useAppNavigation();

  // Function to toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to fetch groups based on the group name
  const handleSearchGroups = async () => {
    if (groupName.trim()) {
      // Simulating an API call to fetch groups
      try {
        const response = await fetch(`/api/groups?name=${encodeURIComponent(groupName)}`);
        const data = await response.json();
        setGroups(data); // Assume data is an array of group objects
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    } else {
      setGroups([]); // Clear groups if input is empty
    }
  };

  // Function to handle the join request
  const handleRequestToJoin = (groupId) => {
    // Logic to request joining the group (e.g., API call)
    console.log(`Requesting to join group with ID: ${groupId}`);
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
          {/* Input field for the group name */}
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className="group-input"
          />
          {/* Button to search for groups */}
          <button className="search-btn" onClick={handleSearchGroups}>
            Search
          </button>

          {/* Displaying the found groups */}
          <div className="found-groups">
            {groups.map((group) => (
              <div key={group.id} className="group-item">
                <h2>{group.name}</h2>
                <button className="request-btn" onClick={() => handleRequestToJoin(group.id)}>
                  Request to Join
                </button>
              </div>
            ))}
          </div>

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

export default JoinGroup;
