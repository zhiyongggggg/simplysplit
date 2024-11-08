import './GroupInfo.css';

import Sidebar from './Sidebar';
import deleteIcon from './delete.png';

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; 
import { db } from './firebase'; 
import { useAppNavigation } from './navigation';
import { collection, addDoc, query, where, doc, getDoc, getDocs, updateDoc, deleteDoc, arrayRemove, arrayUnion } from 'firebase/firestore'; // Firestore functions

function GroupInfo() {
  // Initialization
  const location = useLocation(); 
  const groupId = location.state?.groupId; 
  const currentUserId = location.state?.userId;
  const [groupDoc, setGroupDoc] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [usernames, setUsernames] = useState({});
  const [transactions, setTransactions] = useState([]);

  // Modals
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
  const [isIndividualSettleModalOpen, setIsIndividualSettleModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // For delete transaction portion
  const [deleteTransaction, setDeleteTransaction] = useState(null);

  // For add transactions portion
  const [payerAmounts, setPayerAmounts] = useState({}); // Amount of money paid by each user
  const [peopleAmounts, setPeopleAmounts] = useState({}); // Amount of money to be paid by each user
  const [totalAmount, setTotalAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [unsettledAmount, setUnsettledAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(0); 

  // For settle up portion
  const [settlement, setSettlement] = useState({});
  const [currentSettlement, setCurrentSettlement] = useState(null);
  const [settleAmount, setSettleAmount] = useState(0);

  
  const { handleHome, handleJoinGroup, handleCreateGroup, handleSettings, handleLogout } = useAppNavigation();


  // ============ Fetch group document ============ 
  const fetchGroupDoc = async () => {
    try {
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (groupDoc.exists()) {
        setGroupDoc(groupDoc);
        console.log('GroupDoc fetched.');
      } else {
        console.error('Group ref not found');
      }
    } catch (error) {
      console.error('Error fetching group ref:', error);
    }
  };
  // ============ Calling group document ============ 
  useEffect(() => {
    fetchGroupDoc();
  }, [groupId]);


  // ============ Fetch group data and usernames ============ 
  const fetchGroupData = async () => {
    if (groupId) { 
      if (groupDoc) {
        setGroupData({ id: groupDoc.id, ...groupDoc.data() });
        console.log('Group data: ', groupDoc.data());
        const members = groupDoc.data().members;
        const fetchedRequest = groupDoc.data().requests;
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
        console.error('GroupDoc not found');
      }
    } else {
      console.error('No groupId provided');
    }
  };
  // ============ Calling fetch group data and usernames ============ 
  useEffect(() => {
    fetchGroupData();
  }, [groupDoc]);


  // ============ Fetch group transactions and generate settle up ============ 
  const fetchTransactions = async () => { 
    const transactionsQuery = query(collection(db, 'transactions'), where('groupID', '==', groupId));
  
    try {
      const querySnapshot = await getDocs(transactionsQuery);
      const fetchedTransactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      fetchedTransactions.sort((a, b) => b.transactionTime.toDate() - a.transactionTime.toDate());
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false); 
    }
  };
  // ============ Calling fetch transaction ============ 
  useEffect(() => {
    fetchTransactions();
  }, [groupId]);


  // ============ Toggle Menu ============ 
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  // ============ Toggle Modal ============ 
  const handleOpenConfirmDeleteModal = (transaction) => {
    setIsConfirmDeleteModalOpen(true);
    setDeleteTransaction(transaction);
  };
  const handleOpenAddTransactionModal = () => {
    setIsAddTransactionModalOpen(true);
    setUnsettledAmount(totalAmount); 
  };
  const handleOpenSettleUpModal = () => {
    setIsSettleUpModalOpen(true);
  };
  const handleOpenIndividualSettleUpModal = (s) => {
    setIsSettleUpModalOpen(false);
    setCurrentSettlement(s);
    setSettleAmount(s.amount);
    setIsIndividualSettleModalOpen(true);
  };
  const handleOpenSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };
  const handleCloseConfirmDeleteModal = () => {
    setIsConfirmDeleteModalOpen(false);
    setDeleteTransaction(null);
  };
  const handleCloseTransactionModal = () => {
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
  const handleCloseIndividualSettleUpModal = () => {
    setDescription('');
    setCurrentSettlement(null);
    setIsIndividualSettleModalOpen(false);
    setIsSettleUpModalOpen(true);
  };
  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };


  // ============ Updating the "Remaining Amount" ============ 
  useEffect(() => {
    const totalPayerAmount = Object.values(payerAmounts).reduce((acc, amount) => acc + parseFloat(amount || 0), 0); // Loops through the values of the dictionary (object) and sum them up, storing the number under acc,
    setRemainingAmount(totalAmount - totalPayerAmount);                                                             //each iteration the amount is "amount", if amount is null it will be auto assigned as 0. The ,0 represents initial value of acc
  }, [payerAmounts, totalAmount]);


  // ============ Updating the "Unsettled Amount" ============ 
  useEffect(() => {
    const totalPeopleAmount = Object.values(peopleAmounts).reduce((acc, amount) => acc + parseFloat(amount || 0), 0);
    setUnsettledAmount(totalAmount - totalPeopleAmount);
  }, [peopleAmounts, totalAmount]);


  // ============ Updating Payer and People Amount ============ 
  const handlePayerChange = (payerId, value) => {
    setPayerAmounts((prev) => ({ ...prev, [payerId]: value })); // prev holds the previous dictionary before change, the function essentially copy paste and edits the specific member's value
  };                                                            // there is a need to copy paste rather than just changing because by spreading prev into a new object, a new state is created, triggering useEffect
  const handlePeopleChange = (personId, value) => {
    setPeopleAmounts((prev) => ({ ...prev, [personId]: value }));
  };


  // ============ Split Unsettled Sum Equally ============ 
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

  
  // ============ Apply Tax ============ 
  const applyTax = () => {
    const taxMultiplier = 1 + (parseFloat(taxRate) / 100);
    const updatedAmounts = {};
    // Apply tax to each person involved
    for (const member in peopleAmounts) {
      updatedAmounts[member] = (parseFloat(peopleAmounts[member] || 0) * taxMultiplier).toFixed(2);
    }
    setPeopleAmounts(updatedAmounts);
  };


  // ============ Submit Transaction ============ 
  const handleTransactionSubmit = async () => {
    await handleCreateTransaction();
    await fetchTransactions(); // Necessary to update the main page such that it includes new transaction
    handleCloseTransactionModal();
  };


  // ============ Create New Transaction Entry in Firebase ============ 
  const handleCreateTransaction = async () => {
    setIsLoading(true);

    // Add entry in  "Transactions" db.
    const transactionsCollection = collection(db, 'transactions');
    try {
      const transactionsDocRef = await addDoc(transactionsCollection, {
        groupID: groupId,
        transactionTime: new Date(),
        description: description,
        payer: payerAmounts,
        people: peopleAmounts,
        totalAmount: totalAmount,
        type: "transaction"
      });
      console.log('Transaction logged.');
    } catch (error) {
      console.error('Error logging transaction:', error);
    } 

    // Update balances object in "Group" db.
    const currentBalances = {};
    Object.entries(payerAmounts).forEach(([userId, amount]) => {
      if (!currentBalances[userId]) currentBalances[userId] = { paid: 0, shouldPay: 0 };
      currentBalances[userId].paid += parseFloat(amount);
    });
    Object.entries(peopleAmounts).forEach(([userId, amount]) => {
      if (!currentBalances[userId]) currentBalances[userId] = { paid: 0, shouldPay: 0 };
      currentBalances[userId].shouldPay += parseFloat(amount);
    });

    const shouldPayBalances = {};
    Object.entries(currentBalances).forEach(([userId, { paid, shouldPay }]) => {
      shouldPayBalances[userId] = paid - shouldPay;
    });

    const updatedBalances = groupData.balances;
    Object.entries(shouldPayBalances).forEach(([userId, amount]) => {
      if (!updatedBalances[userId]) updatedBalances[userId] = 0;
      updatedBalances[userId] += parseFloat(amount);
    });

    try {
      const docRef = doc(db, "groups", groupId);
      await updateDoc(docRef, { balances: updatedBalances });
      setGroupData(prevGroupData => ({
        ...prevGroupData,
        balances: updatedBalances
      }));
      console.log('Balances updated.');
    } catch (error) {
      console.error('Error updating balances:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // ============ Generate Debtor and Creditors ============ 
  const calculateDebtorAndCreditor = () => {
    if (!groupData || !groupData.balances) {
      console.log("groupData or balances is not ready yet.");
      return;
    }
    
    console.log(groupData);
    const balances = groupData.balances;
    const creditors = [];
    const debtors = [];
    
    Object.entries(balances).forEach(([userId, balance]) => {
      if (balance > 0) creditors.push({ userId, balance });
      else if (balance < 0) debtors.push({ userId, balance: -balance });
    });
  
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => b.balance - a.balance);
  
    const debtorAndCreditor = [];
    let i = 0; // Pointer for creditors
    let j = 0; // Pointer for debtors
  
    // Process debtorAndCreditor
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
  
      // Determine the settlement amount
      const amount = Math.min(creditor.balance, debtor.balance);
  
      // Create a settlement transaction
      debtorAndCreditor.push({
        payer: debtor.userId,
        receiver: creditor.userId,
        amount,
      });
  
      // Adjust the balances
      creditor.balance -= amount;
      debtor.balance -= amount;
  
      // Move pointers if one party's balance is settled
      if (creditor.balance === 0) i++;
      if (debtor.balance === 0) j++;
    }

    setSettlement(debtorAndCreditor);
  };
  // ============ Calling Generate Debtor and Creditors ============ 
  useEffect(() => {
    calculateDebtorAndCreditor();
  }, [groupData]);

  // ============ Submit Settlement ============ 
  const handleSettlementSubmit = async () => {
    await handleCreateSettlement();
    await fetchTransactions(); // Necessary to update the main page such that it includes new transaction
    handleCloseIndividualSettleUpModal();
  };

  // ============ Create New Settlement Entry in Firebase ============ 
  const handleCreateSettlement = async () => {
    setIsLoading(true);

    // Add entry in  "Transactions" db.
    const transactionsCollection = collection(db, 'transactions');
    try {
      const transactionsDocRef = await addDoc(transactionsCollection, {
        groupID: groupId,
        description: "S - " + description,
        transactionTime: new Date(),
        payer: currentSettlement.payer,
        receiver: currentSettlement.receiver,
        totalAmount: settleAmount,
        type: "settlement"
      });
      console.log('Settlement logged.');
    } catch (error) {
      console.error('Error logging settlement:', error);
    } 

    // Update balances object in "Group" db.
    const updatedBalances = groupData.balances;
    if (!updatedBalances[currentSettlement.payer]) updatedBalances[currentSettlement.payer] = 0;
    updatedBalances[currentSettlement.payer] += parseFloat(settleAmount);
    if (!updatedBalances[currentSettlement.receiver]) updatedBalances[currentSettlement.receiver] = 0;
    updatedBalances[currentSettlement.receiver] -= parseFloat(settleAmount);


    try {
      const docRef = doc(db, "groups", groupId);
      await updateDoc(docRef, { balances: updatedBalances });
      setGroupData(prevGroupData => ({
        ...prevGroupData,
        balances: updatedBalances
      }));
      console.log('Balances updated.');
    } catch (error) {
      console.error('Error updating balances:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  // ============ Submit Deletion ============ 
  const handleDeletionSubmit = async () => {
    await handleDeleteTransaction();
    await fetchTransactions(); // Necessary to update the main page such that it includes new transaction
    handleCloseConfirmDeleteModal();
  };


  // ============ Delete Transaction Entry in Firebase ============ 
  const handleDeleteTransaction = async () => {
    setIsLoading(true);

    const updatedBalances = groupData.balances;
    if (deleteTransaction.type === "settlement") {
      if (!updatedBalances[deleteTransaction.payer]) updatedBalances[deleteTransaction.payer] = 0;
      updatedBalances[deleteTransaction.payer] -= parseFloat(deleteTransaction.totalAmount); //Minus instead of plus
      if (!updatedBalances[deleteTransaction.receiver]) updatedBalances[deleteTransaction.receiver] = 0;
      updatedBalances[deleteTransaction.receiver] += parseFloat(deleteTransaction.totalAmount); //Plus instead of minus
    } else {
      const currentBalances = {};
      Object.entries(deleteTransaction.payer).forEach(([userId, amount]) => {
        if (!currentBalances[userId]) currentBalances[userId] = { paid: 0, shouldPay: 0 };
        currentBalances[userId].paid += parseFloat(amount);
      });
      Object.entries(deleteTransaction.people).forEach(([userId, amount]) => {
        if (!currentBalances[userId]) currentBalances[userId] = { paid: 0, shouldPay: 0 };
        currentBalances[userId].shouldPay += parseFloat(amount);
      });

      const shouldPayBalances = {};
      Object.entries(currentBalances).forEach(([userId, { paid, shouldPay }]) => {
        shouldPayBalances[userId] = paid - shouldPay;
      });

      Object.entries(shouldPayBalances).forEach(([userId, amount]) => {
        if (!updatedBalances[userId]) updatedBalances[userId] = 0;
        updatedBalances[userId] -= parseFloat(amount); //Minus instead of plus
      });
    }

    try {
      const docRef = doc(db, "groups", groupId);
      await updateDoc(docRef, { balances: updatedBalances });
      setGroupData(prevGroupData => ({
        ...prevGroupData,
        balances: updatedBalances
      }));
      console.log('Delete updated.');
    } catch (error) {
      console.error('Error updating balances (deletion):', error);
    } 

    // Remove entry in  "Transactions" db.
    const transactionsCollection = collection(db, 'transactions');
    try {
      const transactionDocRef = doc(transactionsCollection, deleteTransaction.id);
      await deleteDoc(transactionDocRef);
      console.log("Transaction deleted successfully.");
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // ============ Accept and Request Join Requests ============ 
  const handleAcceptRequest = async (request) => {
    try {
      setIsLoading(true); 
      await updateDoc(groupDoc.ref, {
        requests: arrayRemove(request),
      });
  
      await updateDoc(groupDoc.ref, {
        members: arrayUnion(request),
      });

      await fetchGroupDoc(); // Necessary to update the group data states to reflect updated requests
      console.log(`Accepted request from: ${usernames[request]}`);
      setIsLoading(false); 
    } catch (error) {
      console.error('Error accepting request:', error);
    }
    try {
      const userDocRef = doc(db, 'users', request);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const currentGroups = userDoc.data().groupsInvolved || [];
        const updatedGroups = [...currentGroups, groupData.id];
        await updateDoc(userDocRef, {
          groupsInvolved: updatedGroups
        });
      }
    } catch (error) {
      console.error('Error updating groups involved:', error);
    }
  };
  const handleRejectRequest = async (request) => {
    try {
      setIsLoading(true); 
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      await updateDoc(groupDoc.ref, {
        requests: arrayRemove(request),
      });
      await fetchGroupDoc();
      console.log(`Rejected request from: ${usernames[request]}`);
      setIsLoading(false); 
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };
  
  return (
    <div className="groupinfo">
      <div className={`content ${isConfirmDeleteModalOpen || isAddTransactionModalOpen || isSettleUpModalOpen || isIndividualSettleModalOpen || isSettingsModalOpen ? 'blur-background' : ''}`}>
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
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : !groupData ? (
            <div className="error">Group not found.</div>
          ) : (
            <div>
              <h2>{groupData.groupName}</h2>
              <div>
                {transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <div key={index} className={`transettle-item ${transaction.type}`}>
                      <button className="delete-icon" onClick={() => {handleOpenConfirmDeleteModal(transaction)}}>
                        <img src={deleteIcon} alt="Delete" />
                      </button>
                      <h3>{transaction.description}</h3>
                      {transaction.type === "transaction" ? (
                        <>
                          <p>Total Amount: ${transaction.totalAmount}</p>
                          <h4>Payer(s):</h4>
                          {Object.entries(transaction.payer).map(([payerID, amount], idx) => (
                            <p key={idx}>{payerID === currentUserId ? "You" : usernames[payerID]}: ${amount}</p>
                          ))}
                          <h4>People Involved:</h4>
                          {Object.entries(transaction.people).map(([personID, amount], idx) => (
                            <p key={idx}>{personID === currentUserId ? "You" : usernames[personID]}: ${amount}</p>
                          ))}
                        </>
                      ) : (
                        <>
                          <p>{transaction.payer === currentUserId ? "You have" : usernames[transaction.payer] + " has"} paid <strong>{transaction.receiver === currentUserId ? "you" : usernames[transaction.receiver]}</strong>: ${transaction.totalAmount}.</p>
                        </>
                      )
                    }

                      <p>Date: {transaction.transactionTime?.toDate().toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No transactions available.</p>
                )}
              </div>
              {/* Floating Navbar at the bottom */}
              <div className="floating-navbar">
                <button onClick={handleOpenAddTransactionModal}>Add Transaction</button>
                <button onClick={handleOpenSettleUpModal}>Settle Up</button>
                <button onClick={handleOpenSettingsModal}>Settings</button>
              </div>

            </div>
          )}
        </div>

      </div>
      {isConfirmDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal pending-delete">
            <button className="modal-close-btn" onClick={handleCloseConfirmDeleteModal}>X</button>
            <h2>Confirm Delete</h2>
            <div className={`transettle-item ${deleteTransaction.type} pending-delete-transettle`}>
            <h3>{deleteTransaction.description}</h3>
            {deleteTransaction.type === "transaction" ? (
              <>
                <p>Total Amount: ${deleteTransaction.totalAmount}</p>
                <h4>Payer(s):</h4>
                {Object.entries(deleteTransaction.payer).map(([payerID, amount], idx) => (
                  <p key={idx}>{payerID === currentUserId ? "You" : usernames[payerID]}: ${amount}</p>
                ))}
                <h4>People Involved:</h4>
                {Object.entries(deleteTransaction.people).map(([personID, amount], idx) => (
                  <p key={idx}>{personID === currentUserId ? "You" : usernames[personID]}: ${amount}</p>
                ))}
              </>
            ) : (
              <>
                <p><strong>{usernames[deleteTransaction.payer]}</strong> has paid <strong>{usernames[deleteTransaction.receiver]}</strong>: ${deleteTransaction.totalAmount}.</p>
              </>
            )
          }
            <p>Date: {deleteTransaction.transactionTime?.toDate().toLocaleString()}</p>
          </div>
            <div className="function-button-row">
                <button className="function-btn" onClick={handleDeletionSubmit}>Confirm</button>
                <button className="function-btn" onClick={handleCloseConfirmDeleteModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isAddTransactionModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close-btn" onClick={handleCloseTransactionModal}>X</button>
            <h2>Add Transaction</h2>
            <div className="modal-content">
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
              <div className="function-button-row">
                <button className="function-btn" onClick={applyTax}>Apply Tax</button>
                <button className="function-btn" onClick={splitEqually}>Split Equally</button>
              </div>
              <div className="function-button-row">
                <button className="submit-btn" onClick={handleTransactionSubmit}>
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isSettleUpModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close-btn" onClick={handleCloseSettleUpModal}>X</button>
            <h2>Settle Up</h2>
            <label htmlFor="setupField1">Pending Transactions:</label>
            {settlement.map((s) => (
              <button key={s.payer + "_" + s.receiver} className="settlement-entry" onClick={() => handleOpenIndividualSettleUpModal(s)}>
                <span>
                  {s.payer === currentUserId ? "You owe" : usernames[s.payer] + " owes "} {s.receiver === currentUserId ? "you" : usernames[s.receiver]}: <strong>${s.amount}</strong>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {isIndividualSettleModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-back-btn" onClick={handleCloseIndividualSettleUpModal}>←</button>
            <h2>Settle Amount</h2>
            <div className="settlement-entry">
              <span>
                {currentSettlement.payer === currentUserId ? "You owe" : usernames[currentSettlement.payer] + " owes "} {currentSettlement.receiver === currentUserId ? "you" : usernames[currentSettlement.receiver]}: <strong>${currentSettlement.amount}</strong>
              </span>
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
            <div className="form-group">
              <label htmlFor="settleAmountInput">Enter Amount to Settle:</label>
              <input 
                type="number" 
                id="settleAmountInput"
                value={settleAmount}
                min="0"
                max={currentSettlement.amount}
                onChange={(e) => setSettleAmount(Math.min(e.target.value, currentSettlement.amount))}
              />
            </div>
            <button className="function-btn" onClick={handleSettlementSubmit}>
              {isLoading ? "Settling..." : (settleAmount < currentSettlement.amount) ? "Settle Partially" : "Settle All"}
            </button>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupInfo;