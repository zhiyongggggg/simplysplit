import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'; 
import { db } from './firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { useAppNavigation } from './navigation';
import './GroupInfo.css';
import Sidebar from './Sidebar';

function GroupInfo() {
  const { groupName } = useParams(); 
  const location = useLocation(); 
  const groupId = location.state?.groupId; 
  const [groupData, setGroupData] = useState(null);
  const [usernames, setUsernames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payerAmounts, setPayerAmounts] = useState({});
  const [peopleAmounts, setPeopleAmounts] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [unsettledBorrowedAmount, setUnsettledBorrowedAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(0); 
  
  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout, handleGroupInfo } = useAppNavigation();


  /* Backend logic */

  //Fetch group details & usernames of members.
  useEffect(() => {
    const fetchGroupData = async () => {
      if (groupId) { 
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          setGroupData({ id: groupDoc.id, ...groupDoc.data() });

          const members = groupDoc.data().members;
          const fetchedUsernames = {};
          
          for (const memberId of members) {
            const userDoc = await getDoc(doc(db, 'users', memberId)); 
            if (userDoc.exists()) {
              fetchedUsernames[memberId] = userDoc.data().username.split('@')[0];
            } else {
              fetchedUsernames[memberId] = "Unknown User"; 
            }
          }
          setUsernames(fetchedUsernames); 
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

  useEffect(() => {
    const totalPayerAmount = Object.values(payerAmounts).reduce((acc, amount) => acc + parseFloat(amount || 0), 0);
    setRemainingAmount(totalAmount - totalPayerAmount);
  }, [payerAmounts, totalAmount]);

  useEffect(() => {
    const totalPeopleAmount = Object.values(peopleAmounts).reduce((acc, amount) => acc + parseFloat(amount || 0), 0);
    setUnsettledBorrowedAmount(totalAmount - totalPeopleAmount);
  }, [peopleAmounts, totalAmount]);

  /* Open and close side bar */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /* Open and close modal */
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setUnsettledBorrowedAmount(totalAmount); 
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPayerAmounts({});
    setPeopleAmounts({});
    setTotalAmount(0);
    setRemainingAmount(0);
    setUnsettledBorrowedAmount(0);
    setTaxRate(0);
  };

  const handleTransactionSubmit = () => {
    handleCloseModal();
  };

  const handlePayerChange = (payerId, value) => {
    setPayerAmounts((prev) => ({ ...prev, [payerId]: value }));
  };

  const handlePeopleChange = (personId, value) => {
    setPeopleAmounts((prev) => ({ ...prev, [personId]: value }));
  };

  const splitEqually = () => {
    const peopleInvolved = Object.keys(peopleAmounts).filter(member => peopleAmounts[member] === '0');
    
    if (peopleInvolved.length === 0) {
      return; // No one has 0 input, exit the function
    }

    const splitAmount = (remainingAmount / peopleInvolved.length).toFixed(2);
    const updatedAmounts = { ...peopleAmounts };

    // Update the amounts for people involved who have 0
    peopleInvolved.forEach(member => {
      updatedAmounts[member] = splitAmount; // Set the calculated split amount
    });

    setPeopleAmounts(updatedAmounts); // Update state
  };

  const applyTax = () => {
    const taxMultiplier = 1 + (parseFloat(taxRate) / 100); // Convert taxRate percentage to multiplier
    const updatedAmounts = {};

    // Apply tax to each person involved
    for (const member in peopleAmounts) {
      updatedAmounts[member] = (parseFloat(peopleAmounts[member] || 0) * taxMultiplier).toFixed(2);
    }

    setPeopleAmounts(updatedAmounts); // Update state with new amounts
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!groupData) {
    return <div className="error">Group not found.</div>;
  }

  return (
    <div className="app">
      <div className={`content ${isModalOpen ? 'blur-background' : ''}`}>
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
          <h2>{groupData.groupID}</h2>
          <div>
            Transactions here!
          </div>
        </div>

        {/* Floating Navbar at the bottom */}
        <div className="floating-navbar">
          <button onClick={handleOpenModal}>Add Transaction</button>
          <button>Settle Up</button>
          <button>Settings</button>
        </div>
      </div>

      {/* Modal for Add Transaction */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={handleCloseModal}>X</button>
            <h2>Add Transaction</h2>
            
            <div className="form-group">
              <label htmlFor="total-amount">Total Amount:</label>
              <input
                type="number"
                id="total-amount"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="Enter total amount"
              />
            </div>

            {/* Payer Section */}
            <h3>Payer:</h3>
            {groupData.members.map((member) => (
              <div key={member} className="payer-selection">
                <span>{usernames[member] || member}</span> {/* Display username or fallback to ID */}
                <input
                  type="number"
                  min="0"
                  value={payerAmounts[member] || '0'}
                  onChange={(e) => handlePayerChange(member, e.target.value)}
                  style={{ marginLeft: 'auto' }}
                />
              </div>
            ))}

            {/* People Involved Section */}
            <h3>People Involved:</h3>
            {groupData.members.map((member) => (
              <div key={member} className="people-involved-selection">
                <span>{usernames[member] || member}</span> {/* Display username or fallback to ID */}
                <input
                  type="number"
                  min="0"
                  value={peopleAmounts[member] || '0'}
                  onChange={(e) => handlePeopleChange(member, e.target.value)}
                  style={{ marginLeft: 'auto' }}
                />
              </div>
            ))}

            <div>Unsettled Borrowed Amount: {unsettledBorrowedAmount}</div>
            
            <div className="form-group">
              <label htmlFor="tax-rate">Tax Rate (%):</label>
              <input
                type="number"
                id="tax-rate"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="Enter tax rate"
              />
            </div>
            <button className="apply-tax-btn" onClick={applyTax}>Apply Tax</button>

            <button className="split-btn" onClick={splitEqually}>Split Equally</button>

            <button className="submit-btn" onClick={handleTransactionSubmit}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupInfo;
