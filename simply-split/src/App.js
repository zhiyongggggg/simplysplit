import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import CreateGroup from './components/CreateGroup';
import JoinGroup from './components/JoinGroup';
import Settings from './components/Settings';
import GroupInfo from './components/GroupInfo';
import PropagateLoader from "react-spinners/PropagateLoader";

function App() {
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, [auth]);

  // Display a loading indicator while checking auth state
  if (loading) {
    return (
      <div className="loading-spinner">
        <PropagateLoader color="#6c63ff" size={25}/>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <Login onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/home" /> : <Register />}
        />
        <Route
          path="/home"
          element={isAuthenticated ? <Home users={users} /> : <Navigate to="/login" />}
        />
        <Route
          path="/creategroup"
          element={isAuthenticated ? <CreateGroup users={users} /> : <Navigate to="/login" />}
        />
        <Route
          path="/joingroup"
          element={isAuthenticated ? <JoinGroup users={users} /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <Settings users={users} /> : <Navigate to="/login" />}
        />
        <Route 
          path="/group/:groupName" 
          element={isAuthenticated ? <GroupInfo users={users} /> : <Navigate to="/login"/>}
        />
        {/* Default route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
