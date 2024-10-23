import './LoggedIn.css';
import { useState, useEffect } from 'react';
import { useAppNavigation } from './navigation';
import Sidebar from './Sidebar';
import { db, auth } from './firebase'; // Import your Firebase Firestore instance
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; // Firestore functions

function CreateGroup() {
  const [groupName, setGroupName] = useState(''); // State for group name input
  const [groupTag, setGroupTag] = useState(''); // State for generated group tag
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Toggle state for the menu
  const [isLoading, setIsLoading] = useState(false); // Loading state for button

  const { handleHome, handleJoinGroup, handleSettings, handleLogout } = useAppNavigation();

  // Firestore collection reference
  const groupsCollection = collection(db, 'groups');

  // Function to generate a random 4-digit number
  const generateGroupTag = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a random 4-digit number
  };

  // Function to check if the groupName + groupTag already exists in Firestore
  const checkGroupExists = async (groupName, groupTag) => {
    const q = query(groupsCollection, where('groupID', '==', groupName + "#" + groupTag));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // If snapshot is not empty, group exists
  };

  // Function to handle group creation
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (groupName.trim() !== '') {
      let generatedTag;
      let isUnique = false;
      const userID = auth.currentUser.uid;

      // Keep generating tags until we find a unique one
      while (!isUnique) {
        generatedTag = generateGroupTag();
        const groupExists = await checkGroupExists(groupName, generatedTag);
        if (!groupExists) {
          isUnique = true;
        }
      }

      // Once we have a unique groupName + groupTag, add it to Firestore
      try {
        await addDoc(groupsCollection, {
          groupID: groupName + generatedTag,
          createdAt: new Date(),
          members: [userID],
        });
        setGroupTag(generatedTag);
        console.log(`Group Created: ${groupName}#${generatedTag}`);
      } catch (error) {
        console.error('Error creating group:', error);
      } finally {
        setIsLoading(false); // Stop loading state
      }
    }
  };

  // Function to toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      console.log('User ID:', user.uid);
    } else {
      console.log('No user is signed in');
    }
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1>SimplySplit</h1>
        <p>Create your group below!</p>
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
        handleSettings={handleSettings}
        handleLogout={handleLogout}
      />

      <div className="body">
        <form className="create-group-form" onSubmit={handleCreateGroup}>
          <label htmlFor="group-name">Group Name:</label>
          <input
            type="text"
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            required
          />
          <button type="submit" className="create-btn" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
        {groupTag && (
          <p className="group-info">
            Group Created: <strong>{groupName}#{groupTag}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateGroup;
