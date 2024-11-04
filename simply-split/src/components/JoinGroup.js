import './JoinGroup.css';

import Sidebar from './Sidebar';

import { useState } from 'react';
import { useAppNavigation } from './navigation';
import { db, auth } from './firebase'; 
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';

function JoinGroup() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [groupName, setGroupName] = useState(''); 
  const [prevGroupName, setPrevGroupName] = useState(''); 
  const [groupFound, setGroupFound] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 
  const [requestLoading, setRequestLoading] = useState(false); 
  const [noGroupsFound, setNoGroupsFound] = useState(false); 
  const [membershipStatus, setMembershipStatus] = useState('none');

  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout } = useAppNavigation();


  const userID = auth.currentUser.uid;
  // Function to toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to fetch groups based on the group name
  const handleSearchGroups = async (e) => {
    e.preventDefault();
    if (groupName) {
      setIsLoading(true); // Start isLoading
      setNoGroupsFound(false); // Reset no groups found message
      try {
        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('groupName', '==', groupName));
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
        setIsLoading(false);
        setPrevGroupName(groupName);
        setGroupName('');
      }
    } else {
      console.error('No group name provided');
    }
  };

  // Function to handle join request
  const handleRequestToJoin = async () => {
    if (groupInfo) {
      setRequestLoading(true);
      try {
        await updateDoc(doc(db, 'groups', groupInfo.id), {
          requests: arrayUnion(userID),
        });
        setMembershipStatus('requested');
      } catch (error) {
        console.error('Error requesting to join:', error);
      }
      setRequestLoading(false);
    }
  };

  // Function to cancel join request
  const handleCancelRequest = async () => {
    if (groupInfo) {
      setRequestLoading(true);
      try {
        await updateDoc(doc(db, 'groups', groupInfo.id), {
          requests: arrayRemove(userID),
        });
        setMembershipStatus('none');
      } catch (error) {
        console.error('Error canceling request:', error);
      }
      setRequestLoading(false);
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
        <form className="join-group-form" onSubmit={handleSearchGroups}>
          <label htmlFor="group-name">Group Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={handleGroupNameChange}
            placeholder="Enter group name"
            className="group-input"
            autoComplete="off"
            required
          />
          <button type="submit" className="search-btn" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {noGroupsFound && (
          <div className="error">
            No groups found with the name "{prevGroupName}".
          </div>
        )}

        {groupFound && groupInfo && (
          <div className="found-group">
            <div className="found-group-name">
              <h2>{groupInfo.groupName}</h2>
              {requestLoading && (
                <button className="request-btn" disabled>
                  Loading...
                </button>
              )}
              {!requestLoading && membershipStatus === 'member' && (
                <button className="request-btn" disabled>
                  Already a member
                </button>
              )}
              {!requestLoading && membershipStatus === 'requested' && (
                <button className="request-btn" onClick={handleCancelRequest}>
                  Cancel Request
                </button>
              )}
              {!requestLoading && membershipStatus === 'none' && (
                <button className="request-btn" onClick={handleRequestToJoin}>
                  Request to Join
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JoinGroup;