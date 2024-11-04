import './Register.css';

import { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const [error, setError] = useState('');  
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate(); 

  // Function for handling registration
  const handleSubmit = async (event) => {
    event.preventDefault();  
    setIsLoading(true)
    setError(''); 

    // Check if passwords match
    if (password !== cpassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      // If passwords match, try to create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get the user object

      // Create a corresponding entry in the users database
      await setDoc(doc(db, 'users', user.uid), {
        groupsInvolved: [],
        username: email,
      });

      navigate('/login');
    } catch (error) {
      console.error('Registration error', error);
      setIsLoading(false);
      setError('Failed to create an account. Please try again.');
    }
  };

  // Function to navigate to the login page
  const handleLoginRedirect = () => {
    navigate('/login'); 
  };

  return (
    <div className="register">
      <h1>Register an Account</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input 
            type="text" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </label>
        <label>
          Password:
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </label>
        <label>
          Confirm Password:
          <input 
            type="password" 
            value={cpassword} 
            onChange={(e) => setCPassword(e.target.value)} 
            required 
          />
          {/* Error message if passwords don't match */}
          {error && <p className="error-message">{error}</p>}
        </label>

        <button type="submit">
          {isLoading ? 'Loading...' : 'Register'}
        </button>
        <p className="login-link">
          Already have an account? Login
          <span onClick={handleLoginRedirect} className="clickable"> here!</span>
        </p>
      </form>
    </div>
  );
}

export default Register;
