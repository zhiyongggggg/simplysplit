import './LoggedIn.css';
import { useState, useEffect } from 'react';
import { useAppNavigation } from './navigation';
import Sidebar from './Sidebar';
import { db, auth } from './firebase'; // Make sure to import your Firestore instance
import { doc, getDoc } from 'firebase/firestore';

function Home() {
  const [groups, setGroups] = useState([]); // State to store groups
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Toggle state for the menu
  const [isLoading, setIsLoading] = useState(true); // State for loading status

  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout, handleGroupInfo } = useAppNavigation();

  // Function to toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const fetchUserGroups = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const groupIDs = userDoc.data().groupsInvolved; // Get the groups involved

          // Fetch each group by its ID
          const groupPromises = groupIDs.map(async (groupID) => { 
            const groupDoc = await getDoc(doc(db, 'groups', groupID));
            return groupDoc.exists() ? { id: groupDoc.id, ...groupDoc.data() } : null;
          });

          const groupResults = await Promise.all(groupPromises);
          setGroups(groupResults.filter(group => group !== null)); // Filter out any null results
        }
      }
      setIsLoading(false); // Set loading to false after fetching
    };

    fetchUserGroups();
  }, []);

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
        <h2>Your Groups</h2> {/* Header for groups */}
        {isLoading ? (
          <div className="loading-spinner">Loading...</div> // Loading spinner
        ) : groups.length === 0 ? (
          <p>You are not in any groups</p> // Message when no groups are found
        ) : (
          <div className="grouplist">
            {groups.map((group) => (
              <button key={group.id} className="group" onClick={() => handleGroupInfo(group.groupID, group.id)}>
                <h2>{group.groupID}</h2> {/* Display group name or any other detail */}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
