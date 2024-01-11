import soundcheckLogo from './assets/img/soundcheckLogo.png'
import '../App.css'
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import waveform from './assets/img/waveform.webp'


export const Header = () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profilePic, setProfilePic] = useState('')
  const [username, setUsername] = useState('');
  const [signOutSuccess, setSignOutSuccess] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        auth.onAuthStateChanged(async (user) => {
          if (user) {
            const userId = user.uid;
            const userRef = doc(db, 'users', userId);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
              setUsername(userData.username)
              setProfilePic(userData.profileImage)
              setIsSignedIn(true);
            } else {
              console.log("User not found!");
            }
          }
          setIsLoaded(true);
        });
      } catch (error) {
        setError(error.message);
        setIsLoaded(true);
      }
    };
    fetchData();
  }, []);

  const doSignOut = async () => {
    try {
      await signOut(auth);
      setIsSignedIn(false);
      navigate('/');
    } catch (error) {
      setSignOutSuccess(`There was an error signing out: ${error.message}!`);
    }
  };

  return (
    <>
      <div id='headerPicRow'>
        <img id='headerLogo' src={soundcheckLogo} alt='logo' />
        {/* <img id='waveform' src={waveform} alt='waveform' /> */}
      </div>
      {isSignedIn && (
        <div id='dashUserRow'>
          <img id='dashboardPic' src={profilePic} alt='profile' />
          <h2 id='dashboardUsername'>{username}</h2>
          <div id='headerSignOutButton'>
            <button className='button' onClick={doSignOut}>Sign out</button>
            <br />
            {signOutSuccess}
          </div>
        </div>
      )}
    </>
  );
}