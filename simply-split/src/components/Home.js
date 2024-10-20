import './Home.css';
import { useEffect, useState } from 'react';
import { db, collection, getDocs } from './firebase';  // Import Firestore utilities

function App() {
  const [users, setUsers] = useState([]);  // State to store users

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');  // Replace 'users' with your collection name
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
      console.log(usersList)
    };

    fetchUsers();
  }, []); 

  return (
    <div className="app">
      <div className="header">
        <h1>SimplySplit</h1>
        <p>Log your group expenses here!!!</p>
      </div>
      <div className="body">
        <div className="userlist">
          {users.map((user) => (
            <button key={user.username} className="user">
              <h2>{user.username}</h2> 
            </button>
          ))}
          <button className="settings-btn">
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
