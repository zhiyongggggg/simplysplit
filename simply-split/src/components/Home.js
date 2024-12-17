import './Home.css';

import Sidebar from './Sidebar';
import PropagateLoader from "react-spinners/PropagateLoader";

import { useState, useEffect } from 'react';
import { useAppNavigation } from './navigation';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function Home() {
  const user = auth.currentUser;
  const [groups, setGroups] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const colors = ["5ac8fc", "39e53d", "bc62ff", "ffcc00", "ff2d55"]

  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout, handleGroupInfo } = useAppNavigation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const fetchUserGroups = async () => {
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
  }, [user]);

  return (
    <div className="home">
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
        <div className="category-box">Your Groups</div>
        {isLoading ? (
          <div className="loading-spinner">
            <PropagateLoader color="#1e90ff" size={25}/>
          </div>
        ) : groups.length === 0 ? (
          <div className="error">You are not in any groups</div> // Message when no groups are found
        ) : (
          <div className="grouplist">
            {groups.map((group, index) => (
              <button key={group.id} className="group" onClick={() => handleGroupInfo(group.groupName, group.id, user.uid)} style={{ border: `1px solid #${colors[index % colors.length]}` }}>
                <h2>{group.groupName}</h2>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
