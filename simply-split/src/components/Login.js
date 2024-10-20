import { useState } from 'react';
import { auth, googleProvider } from './firebase' 
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom'; 
import './Login.css';

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
      // Sign in user with Firebase using email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);
      onLogin();
      navigate('/home');
    } catch (error) {
      console.error('Login error', error);
      setError('Invalid email or password. Please try again.');
    }
  };

  // Function for Google login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/home');
    } catch (error) {
      console.error('Google login error', error);
      setError('Login failed. Please try again.');
    }
  };

  // Function to navigate to the register page
  const handleRegisterRedirect = () => {
    navigate('/register'); // Redirect to the register page
  };

  return (
    <div className="login">
      <h1>Login to SimplySplit</h1>
      <form onSubmit={handleLogin}>
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
          {/* Error message if passwords don't match */}
          {error && <p className="error-message">{error}</p>}
        </label>
        <p className="register-link">
          Don't have an account? Register
          <span onClick={handleRegisterRedirect} className="clickable"> here!</span>
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
