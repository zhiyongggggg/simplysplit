import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

export const useAppNavigation = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    try {
      navigate('/home');
    } catch (error) {
      console.error('Error navigating to Home Page:', error);
    }
  };

  const handleJoinGroup = async () => {
    try {
      navigate('/joingroup');
    } catch (error) {
      console.error('Error navigating to Join Group Page:', error);
    }
  };

  const handleCreateGroup = async () => {
    try {
      navigate('/creategroup');
    } catch (error) {
      console.error('Error navigating to Create Group Page:', error);
    }
  };

  const handleGroupInfo = (groupName, groupId) => {
    try {
      navigate(`/group/${groupName}`, { state: { groupId } }); 
    } catch (error) {
      console.error('Error navigating to Group Info Page:', error);
    }
  };  

  const handleSettings = async () => {
    try {
      navigate('/settings');
    } catch (error) {
      console.error('Error navigating to settings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    handleHome,
    handleJoinGroup,
    handleCreateGroup,
    handleGroupInfo,
    handleSettings,
    handleLogout,
  };
};
