import './App.css';

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db, collection, getDocs } from './components/firebase';  
import Login from './components/Login';
import Home from './components/Home';

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
          path="/home"
          element={isAuthenticated ? <Home users={users} /> : <Navigate to="/login" />}
        />
        {/* Default route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
