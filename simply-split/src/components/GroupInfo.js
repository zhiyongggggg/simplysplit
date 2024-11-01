import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'; 
import { db, auth } from './firebase'; 
import { useAppNavigation } from './navigation';
import './GroupInfo.css';
import Sidebar from './Sidebar';
import { collection, addDoc, query, where, doc, getDoc, getDocs, updateDoc, arrayRemove, arrayUnion, FieldValue } from 'firebase/firestore'; // Firestore functions

function GroupInfo() {
  const { groupName } = useParams(); 
  const location = useLocation(); 
  const groupId = location.state?.groupId; 
  const [groupData, setGroupData] = useState(null);
  const [usernames, setUsernames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [payerAmounts, setPayerAmounts] = useState({}); // Amount of money paid by each user
  const [peopleAmounts, setPeopleAmounts] = useState({}); // Amount of money to be paid by each user
  const [totalAmount, setTotalAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [unsettledAmount, setUnsettledAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(0); 
  
  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout, handleGroupInfo } = useAppNavigation();


  /* Backend logic */
  //Fetch group details & usernames of members.
  const fetchGroupData = async () => {
    if (groupId) { 
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (groupDoc.exists()) {
        setGroupData({ id: groupDoc.id, ...groupDoc.data() });
        const fetchedRequest = groupDoc.data().requests;
        const members = groupDoc.data().members;
        const fetchedUsernames = {};
        
        for (const memberId of members) {
          const userDoc = await getDoc(doc(db, 'users', memberId)); 
          if (userDoc.exists()) {
            fetchedUsernames[memberId] = userDoc.data().username.split('@')[0];
          } else {
            fetchedUsernames[memberId] = "Invalid User"; 
          }
        }
        for (const memberId of fetchedRequest) {
          const userDoc = await getDoc(doc(db, 'users', memberId)); 
          if (userDoc.exists()) {
            fetchedUsernames[memberId] = userDoc.data().username.split('@')[0];
          } else {
            fetchedUsernames[memberId] = "Invalid User"; 
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

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);
  // Fetch transactions.
  const fetchTransactions = async () => {  // Move this function outside of useEffect
    const transactionsQuery = query(collection(db, 'transactions'), where('groupID', '==', groupId));
  
    try {
      const querySnapshot = await getDocs(transactionsQuery);
      const fetchedTransactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      fetchedTransactions.sort((a, b) => b.transactionTime.toDate() - a.transactionTime.toDate());
  
      console.log('Fetched Transactions:', fetchedTransactions);
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false); 
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, [groupId]);
  // Calculating the remaining amount
  useEffect(() => {
    const totalPayerAmount = Object.values(payerAmounts).reduce((acc, amount) => acc + parseFloat(amount || 0), 0); // Loops through the values of the dictionary (object) and sum them up, storing the number under acc,
    setRemainingAmount(totalAmount - totalPayerAmount);                                                             //each iteration the amount is "amount", if amount is null it will be auto assigned as 0. The ,0 represents initial value of acc
  }, [payerAmounts, totalAmount]);
  // Calculating the unsettled amount
  useEffect(() => {
    const totalPeopleAmount = Object.values(peopleAmounts).reduce((acc, amount) => acc + parseFloat(amount || 0), 0);
    setUnsettledAmount(totalAmount - totalPeopleAmount);
  }, [peopleAmounts, totalAmount]);
  /* Open and close side bar */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /* Open and close modal */
  const handleOpenAddTransactionModal = () => {
    setIsAddTransactionModalOpen(true);
    setUnsettledAmount(totalAmount); 
  };
  const handleOpenSettleUpModal = () => {
    setIsSettleUpModalOpen(true);
  };
  const handleOpenSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsAddTransactionModalOpen(false);
    setPayerAmounts({});
    setPeopleAmounts({});
    setTotalAmount(0);
    setDescription('');
    setRemainingAmount(0);
    setUnsettledAmount(0);
    setTaxRate(0);
  };
  const handleCloseSettleUpModal = () => {
    setIsSettleUpModalOpen(false);
  };
  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };
  const handlePayerChange = (payerId, value) => {
    setPayerAmounts((prev) => ({ ...prev, [payerId]: value })); // prev holds the previous dictionary before change, the function essentially copy paste and edits the specific member's value
  };                                                            // there is a need to copy paste rather than just changing because by spreading prev into a new object, a new state is created, triggering useEffect
  const handlePeopleChange = (personId, value) => {
    setPeopleAmounts((prev) => ({ ...prev, [personId]: value }));
  };
  const handleTransactionSubmit = async () => {
    await handleCreateTransaction(); // Call the function to create a transaction
    await fetchTransactions(); // Fetch transactions again after creating a new transaction
    handleCloseModal();
  };
  const handleAcceptRequest = async (request) => {
    try {
      setIsLoading(true); 
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      await updateDoc(groupDoc.ref, {
        requests: arrayRemove(request),
      });
  
      await updateDoc(groupDoc.ref, {
        members: arrayUnion(request),
      });
      await fetchGroupData();
      console.log(`Accepted request from: ${usernames[request]}`);
      setIsLoading(false); 
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };
  
  const handleRejectRequest = async (request) => {
    try {
      setIsLoading(true); 
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      await updateDoc(groupDoc.ref, {
        requests: arrayRemove(request),
      });
      await fetchGroupData();
      console.log(`Rejected request from: ${usernames[request]}`);
      setIsLoading(false); 
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };
  
  const splitEqually = () => {
    const peopleInvolved = groupData.members.filter(
      member => !peopleAmounts[member] || peopleAmounts[member] == 0
    );
    if (peopleInvolved.length === 0) {
      return; // No one has 0 input, exit the function
    }
    const splitAmount = (unsettledAmount / peopleInvolved.length).toFixed(2);
    const updatedAmounts = { ...peopleAmounts };
    // Update the amounts for people involved who have 0
    peopleInvolved.forEach(member => {
      updatedAmounts[member] = splitAmount; // Set the calculated split amount
    });
    setPeopleAmounts(updatedAmounts);
  };
  const applyTax = () => {
    const taxMultiplier = 1 + (parseFloat(taxRate) / 100); // Convert taxRate percentage to multiplier
    const updatedAmounts = {};
    // Apply tax to each person involved
    for (const member in peopleAmounts) {
      updatedAmounts[member] = (parseFloat(peopleAmounts[member] || 0) * taxMultiplier).toFixed(2);
    }
    setPeopleAmounts(updatedAmounts);
  };

  // Function to handle group creation
  const handleCreateTransaction = async () => {
    setIsLoading(true);
    const transactionsCollection = collection(db, 'transactions');
    try {
      const transactionsDocRef = await addDoc(transactionsCollection, {
        groupID: groupId,
        transactionTime: new Date(),
        description: description,
        payer: payerAmounts,
        people: peopleAmounts,
        totalAmount: totalAmount
      });
      console.log('Transaction logged.');
    } catch (error) {
      console.error('Error logging transaction:', error);
    } finally {
      setIsLoading(false); // Stop loading state
    }
  };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading">Loading...</div>
      </div>
    );
  }  
  if (!groupData) {
    return <div className="error">Group not found.</div>;
  }
  return (
    <div className="app">
      <div className={`content ${isAddTransactionModalOpen ? 'blur-background' : ''}`}>
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
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div key={index} className="transaction">
                  <h3>{transaction.description}</h3>
                  <p>Total Amount: ${transaction.totalAmount}</p>
                  {/* Display each payer on a new line */}
                  <h4>Payer(s):</h4>
                  {Object.entries(transaction.payer).map(([payerID, amount], idx) => (
                    <p key={idx}>{usernames[payerID]}: ${amount}</p>
                  ))}
                  {/* Display each person involved on a new line */}
                  <h4>People Involved:</h4>
                  {Object.entries(transaction.people).map(([personID, amount], idx) => (
                    <p key={idx}>{usernames[personID]}: ${amount}</p>
                  ))}
                  <p>Date: {transaction.transactionTime?.toDate().toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p>No transactions available.</p>
            )}
          </div>
        </div>

        {/* Floating Navbar at the bottom */}
        <div className="floating-navbar">
          <button onClick={handleOpenAddTransactionModal}>Add Transaction</button>
          <button onClick={handleOpenSettleUpModal}>Settle Up</button>
          <button onClick={handleOpenSettingsModal}>Settings</button>
        </div>
      </div>
      {/* Modal for Add Transaction */}
      {isAddTransactionModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close-btn" onClick={handleCloseModal}>X</button>
            <h2>Add Transaction</h2>
            
            <div className="form-group">
              <label htmlFor="total-amount">Total Amount:</label>
              <input
                type="number"
                id="total-amount"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="form-group">
              <label htmlFor="total-amount">Description:</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={(e) => e.target.select()}
                autoComplete='off'
              />
            </div>
            {/* Payer Section */}
            <h3>Payer:</h3>
            {groupData.members.map((member) => (
              <div key={member} className="payer-selection">
                <span>{usernames[member]}</span> 
                <input
                  type="number"
                  min="0"
                  value={payerAmounts[member] || 0}
                  onChange={(e) => handlePayerChange(member, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  style={{ marginLeft: 'auto' }}
                />
              </div>
            ))}
            <div>Remaining Amount: {remainingAmount}</div>
            <br></br>
            {/* People Involved Section */}
            <h3>People Involved:</h3>
            {groupData.members.map((member) => (
              <div key={member} className="people-involved-selection">
                <span>{usernames[member]}</span> 
                <input
                  type="number"
                  min="0"
                  value={peopleAmounts[member] || 0}
                  onChange={(e) => handlePeopleChange(member, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  style={{ marginLeft: 'auto' }}
                />
              </div>
            ))}
            <div>Unsettled Borrowed Amount: {unsettledAmount}</div>
            <div className="form-group">
              <label htmlFor="tax-rate">Tax Rate (%):</label>
              <input
                type="number"
                id="tax-rate"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="button-row">
              <button className="function-btn" onClick={applyTax}>Apply Tax</button>
              <button className="function-btn" onClick={splitEqually}>Split Equally</button>
            </div>
            <button className="submit-btn" onClick={handleTransactionSubmit}>Submit</button>
          </div>
        </div>
      )}
      {isSettleUpModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close-btn" onClick={handleCloseSettleUpModal}>X</button>
            <h2>Set Up</h2>
            {/* Add your setup fields here */}
            <div className="form-group">
              <label htmlFor="setupField1">Setup Field 1:</label>
              <input type="text" id="setupField1" />
            </div>
            <div className="form-group">
              <label htmlFor="setupField2">Setup Field 2:</label>
              <input type="text" id="setupField2" />
            </div>
            <button className="submit-btn" onClick={handleCloseSettleUpModal}>Complete Setup</button>
          </div>
        </div>
      )}
      {isSettingsModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close-btn" onClick={handleCloseSettingsModal}>X</button>
            <h2>Settings</h2>
            <label htmlFor="setupField1">Group Members:</label>
            {groupData.members.map((member) => (
              <div key={member} className="group-members">
                <span>{usernames[member]}</span> 
              </div>
            ))}
            <label htmlFor="setupField1">Requests:</label>
            {groupData.requests.map((request) => (
              <div key={request} className="group-members">
                <span>{usernames[request]}</span> 
                <span className="request-actions">
                  <button className="request-button" onClick={() => handleAcceptRequest(request)}>✔️</button>
                  <button className="request-button" onClick={() => handleRejectRequest(request)}>❌</button>
                </span>
              </div>
            ))}
            <button className="submit-btn" onClick={handleCloseSettingsModal}>Save Settings</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupInfo;