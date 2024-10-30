import './LoggedIn.css';
import { useState, useEffect } from 'react';
import { useAppNavigation } from './navigation';
import Sidebar from './Sidebar';
import { db } from './firebase'; // Ensure you import your Firestore db instance
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore functions

function JoinGroup() {
  const [users, setUsers] = useState([]); // State to store users
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Toggle state for the menu
  const [groupName, setGroupName] = useState(''); // State to store the group name
  const [groups, setGroups] = useState([]); // State to store found groups
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout } = useAppNavigation();

  // Function to toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to fetch groups based on the group name
  const handleSearchGroups = async () => {
    if (groupName.trim()) {
      setIsLoading(true); // Set loading state
      const groupsQuery = query(collection(db, 'groups'), where('name', '==', groupName)); // Query groups by name
      
      try {
        const querySnapshot = await getDocs(groupsQuery);
        const fetchedGroups = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setGroups(fetchedGroups); // Store the fetched groups in state
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setIsLoading(false); // Reset loading state
      }
    } else {
      setGroups([]); // Clear groups if input is empty
    }
  };

  // Function to handle the join request
  const handleRequestToJoin = async (groupId) => {
    // Logic to request joining the group (e.g., API call)
    console.log(`Requesting to join group with ID: ${groupId}`);
    // You can implement the logic to update the group requests in Firestore here
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
          <button className="search-btn" onClick={handleSearchGroups} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>

          {/* Displaying the found groups */}
          <div className="found-groups">
            {groups.length > 0 ? (
              groups.map((group) => (
                <div key={group.id} className="group-item">
                  <h2>{group.name}</h2>
                  <button className="request-btn" onClick={() => handleRequestToJoin(group.id)}>
                    Request to Join
                  </button>
                </div>
              ))
            ) : (
              <p>No groups found.</p>
            )}
          </div>

          {users.map((user) => (
            <button key={user.username} className="user">
              <h2>{user.username}</h2> 
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default JoinGroup;
