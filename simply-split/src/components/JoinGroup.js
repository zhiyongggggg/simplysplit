import './LoggedIn.css';
import './JoinGroup.css'; // Import the CSS for this component
import { useState } from 'react';
import { useAppNavigation } from './navigation';
import Sidebar from './Sidebar';
import { db, auth } from './firebase'; 
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';

function JoinGroup() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [groupName, setGroupName] = useState(''); 
  const [groupFound, setGroupFound] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null); // Changed to null for easier checks
  const [loading, setLoading] = useState(false); // State for loading
  const [noGroupsFound, setNoGroupsFound] = useState(false); // State for no groups found
  const [membershipStatus, setMembershipStatus] = useState('none'); // State for membership status

  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout } = useAppNavigation();


  const userID = auth.currentUser.uid;
  // Function to toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to fetch groups based on the group name
  const handleSearchGroups = async () => {
    if (groupName) {
      setLoading(true); // Start loading
      setNoGroupsFound(false); // Reset no groups found message
      try {
        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('groupID', '==', groupName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Get the first matching document only
          const groupDoc = querySnapshot.docs[0];
          const groupData = groupDoc.data();

          setGroupInfo({ id: groupDoc.id, ...groupData });
          setGroupFound(true);

          // Check if current user is a member
          if (groupData.members && groupData.members.includes(userID)) {
            setMembershipStatus('member');
          } 
          // Check if the current user has a pending request
          else if (groupData.requests && groupData.requests.includes(userID)) {
            setMembershipStatus('requested');
          } 
          // User is neither a member nor has a request
          else {
            setMembershipStatus('none');
          }
        } else {
          console.error('Group not found');
          setNoGroupsFound(true); // Set no groups found message
          setGroupFound(false);
        }
      } catch (error) {
        console.error('Error searching for group:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      console.error('No group name provided');
    }
  };

  // Function to handle join request
  const handleRequestToJoin = async () => {
    if (groupInfo) {
      try {
        await updateDoc(doc(db, 'groups', groupInfo.id), {
          requests: arrayUnion(userID),
        });
        setMembershipStatus('requested');
      } catch (error) {
        console.error('Error requesting to join:', error);
      }
    }
  };

  // Function to cancel join request
  const handleCancelRequest = async () => {
    if (groupInfo) {
      try {
        await updateDoc(doc(db, 'groups', groupInfo.id), {
          requests: arrayRemove(userID),
        });
        setMembershipStatus('none');
      } catch (error) {
        console.error('Error canceling request:', error);
      }
    }
  };

  // Function to handle input change
  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
    setNoGroupsFound(false); // Reset no groups found message when typing
    setMembershipStatus('none'); // Reset membership status when typing
  };

  return (
    <div className="joingroup">
      <div className="header">
        <h1>SimplySplit</h1>
        <p>Log your group expenses here!</p>
        <div className="hamburger" onClick={toggleMenu}>
          &#9776;
        </div>
      </div>

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
        <div>
          <input
            type="text"
            value={groupName}
            onChange={handleGroupNameChange}
            placeholder="Enter group name"
            className="group-input"
          />
          {loading ? (
            <button className="search-btn" disabled>
              Loading...
            </button>
          ) : (
            <button className="search-btn" onClick={handleSearchGroups}>
              Search
            </button>
          )}
          
          {noGroupsFound && (
            <div className="error">
              No groups found with the name "{groupName}".
            </div>
          )}

          {groupFound && groupInfo && (
            <div className="found-group-name">
              <h2>{groupInfo.groupID}</h2>
              {membershipStatus === 'member' && (
                <button className="request-btn" disabled>
                  Already a member
                </button>
              )}
              {membershipStatus === 'requested' && (
                <button className="request-btn" onClick={handleCancelRequest}>
                  Cancel Request
                </button>
              )}
              {membershipStatus === 'none' && (
                <button className="request-btn" onClick={handleRequestToJoin}>
                  Request to Join
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JoinGroup;