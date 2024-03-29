import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SearchIcon from '@mui/icons-material/Search';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../App.css';

export const SimpleBottomNavigation = () => {
  const [value, setValue] = React.useState(0);
  const [isSignedIn, setIsSignedIn] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigation = (index) => {
    setValue(index);

    switch (index) {
      case 0:
        navigate('/search');
        break;
      case 1:
        navigate('/browse');
        break;
      case 2:
        navigate('/forum');
        break;
      case 3:
        navigate('/userDashboard');
        break;
      default:
        break;
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <div id='navBar'>
      <Box sx={{ width: 100 }}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            handleNavigation(newValue);
          }}
        >
          <BottomNavigationAction icon={<SearchIcon />} />
          <BottomNavigationAction icon={<ExploreIcon />} />
          <BottomNavigationAction icon={<ChatIcon />} />
          <BottomNavigationAction icon={<AccountCircleIcon />} />
        </BottomNavigation>
      </Box>
    </div>
  );
};