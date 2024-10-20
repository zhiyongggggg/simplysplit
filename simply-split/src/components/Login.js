import { useState } from 'react';
import { auth, provider, signInWithPopup } from './firebase'; 
import { useNavigate } from 'react-router-dom'; 
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  // Function for normal login
  const handleSubmit = (event) => {
    event.preventDefault();
    // Normal login logic goes here
    onLogin();  // Assuming login is successful
  };

  // Function for Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user); // User info returned by Google
      onLogin();  // Set user as authenticated
    } catch (error) {
      console.error('Google login error', error);
    }
  };

  // Function to navigate to the register page
  const handleRegisterRedirect = () => {
    navigate('/register'); // Redirect to the register page
  };

  return (
    <div className="login">
      <h1>Login to SimplySplit</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </label>
        <br />
        <label>
          Password:
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </label>
        <br />
        <p className="register-link">
          Don't have an account? 
          <span onClick={handleRegisterRedirect} className="clickable"> Register here!</span>
        </p>
        <button type="submit">Login</button>
        <div className="separator">OR</div>
        <button onClick={handleGoogleLogin}>
          Login with Google
        </button>
      </form>
      

    </div>
  );
}

export default Login;
