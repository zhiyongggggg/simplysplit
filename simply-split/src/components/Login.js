import './Login.css';

import loginregister from '../loginregister.png';

import { useState } from 'react';
import { auth } from './firebase' 
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom'; 

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');  // State to handle login errors
  const navigate = useNavigate(); // Initialize navigate

  // Function for normal login
  const handleLogin = async (event) => {
    event.preventDefault();  // Prevent form refresh on submit
    setError('');  // Clear any previous error

    try {
      let tempEmail = email;
      if (!email.includes('@')) {
        tempEmail = email + "@gmail.com";
      }
      // Sign in user with Firebase using email and password
      const userCredential = await signInWithEmailAndPassword(auth, tempEmail, password);
      console.log('User logged in:', userCredential.user);
      onLogin(userCredential.user.uid);
      navigate('/home');
    } catch (error) {
      console.error('Login error', error);
      setError('Invalid email or password. Please try again.');
    }
  };

  // Function to navigate to the register page
  const handleRegisterRedirect = () => {
    navigate('/register'); // Redirect to the register page
  };

  return (
    <div className="login">
      <img src={loginregister} />
      <h1>The only expense tracking web app you need.</h1>
      <form onSubmit={handleLogin}>
        <label>
          Username or Email:
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
          {/* Error message if passwords don't match */}
          {error && <p className="error-message">{error}</p>}
        </label>
        <button type="submit">Login</button>
        <p className="register-link">
          <span onClick={handleRegisterRedirect} className="clickable">- Register -</span>
        </p>
      </form>
      

    </div>
  );
}

export default Login;
