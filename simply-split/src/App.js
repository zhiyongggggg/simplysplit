import './App.css';

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import CreateGroup from './components/CreateGroup';
import JoinGroup from './components/JoinGroup';
import Settings from './components/Settings';
import GroupInfo from './components/GroupInfo';

function App() {
  const [users, setUsers] = useState([]);  // State to store users
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth state


  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/register"
          element={<Register />}
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
