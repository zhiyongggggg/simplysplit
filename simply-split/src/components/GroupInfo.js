import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'; // Import useLocation
import { db } from './firebase'; // Import your Firestore instance
import { doc, getDoc } from 'firebase/firestore';

function GroupInfo() {
  const { groupName } = useParams(); // Get groupName from URL parameters
  const location = useLocation(); // Get location object
  const groupId = location.state?.groupId; // Access groupId from location state
  console.log(groupId);
  const [groupData, setGroupData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (groupId) { // Check if groupId exists
        const groupDocRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupDocRef);
        if (groupDoc.exists()) {
          setGroupData({ id: groupDoc.id, ...groupDoc.data() });
        } else {
          console.error('Group not found');
        }
      } else {
        console.error('No groupId provided');
      }
      setIsLoading(false);
    };

    fetchGroupData();
  }, [groupId]);

  const handleAddTransaction = () => {
    // Implement the logic to add a transaction
    console.log('Add Transaction clicked');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!groupData) {
    return <div className="error">Group not found.</div>;
  }

  return (
    <div className="group-info">
      <h1>{groupData.groupID}</h1>
      <h2>Members Involved:</h2>
      <ul>
        {groupData.members.map((member, index) => (
          <li key={index}>{member}</li>
        ))}
      </ul>
      <button onClick={handleAddTransaction}>Add Transaction</button>
    </div>
  );
}

export default GroupInfo;
