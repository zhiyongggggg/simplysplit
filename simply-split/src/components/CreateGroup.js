import './CreateGroup.css';

import Sidebar from './Sidebar';

import { useState, useEffect } from 'react';
import { useAppNavigation } from './navigation';
import { db, auth, updateDoc, doc, arrayUnion } from './firebase'; // Import your Firebase Firestore instance
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; // Firestore functions

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [lastCreatedGroupName, setLastCreatedGroupName] = useState('');
  const [groupTag, setGroupTag] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { handleHome, handleJoinGroup, handleSettings, handleLogout } = useAppNavigation();

  // Firestore collection reference
  const groupsCollection = collection(db, 'groups');

  // Function to generate a random 4-digit number
  const generateGroupTag = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a random 4-digit number
  };

  // Function to check if the groupName + groupTag already exists in Firestore
  const checkGroupExists = async (groupName, groupTag) => {
    const q = query(groupsCollection, where('groupName', '==', groupName + "#" + groupTag));
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
        const groupDocRef = await addDoc(groupsCollection, {
          groupName: groupName + "#" + generatedTag,
          createdAt: new Date(),
          members: [userID],
          requests: [],
          balances: {},
        });

        setGroupTag(generatedTag);
        setLastCreatedGroupName(groupName); // Store the created group name
        console.log(`Group Created: ${groupName}#${generatedTag}`);

        // Clear the input field after successful creation
        setGroupName('');

        const userDocRef = doc(db, 'users', userID); // Assuming 'users' is your users collection
        await updateDoc(userDocRef, {
          groupsInvolved: arrayUnion(groupDocRef.id) // Use arrayUnion to add group ID to the array
        });
        
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
    <div className="creategroup">
      <div className="header">
        {/* Hamburger Menu on the left */}
        <div className="hamburger" onClick={toggleMenu}>
          &#9776;
        </div>
        <h1>SimplySplit</h1>
      </div>
      <hr className="divider" />

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
          <label htmlFor="group-name">Create a group:</label>
          <input
            type="text"
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name..."
            autoComplete="off"
            required
          />
          <button type="submit" className="create-btn" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
        {groupTag && (
          <p className="group-info">
            Group <strong>{lastCreatedGroupName}#{groupTag}</strong> has been successful created.
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateGroup;
