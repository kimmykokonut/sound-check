import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from './../firebase';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function SignIn() {
  const [signUpSuccess, setSignUpSuccess] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signInSuccess, setSignInSuccess] = useState(null);
  const [signOutSuccess, setSignOutSuccess] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isSignInHidden, setIsSignInHidden] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  const toggleSignInAndOutVisibility = () => {
    setShowSignUp(!showSignUp);
    setIsSignInHidden(!isSignInHidden);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
  };

  const doSignUp = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;
    const username = e.target.username.value;
    const city = e.target.city.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);

      if (profileImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile_images/${user.uid}`);
        await uploadBytes(storageRef, profileImage);
        const imageUrl = await getDownloadURL(storageRef);
        await setDoc(userDocRef, { username, city, profileImage: imageUrl });
      } else {
        await setDoc(userDocRef, { username, city });
      }
      setSignUpSuccess(`You've successfully signed up, ${user.email}!`);
      setSignInSuccess(null);
      setIsSignedIn(true);
      navigate('/UserDashboard');
    } catch (error) {
      setSignUpSuccess(`There was an error signing up: ${error.message}!`);
    }
  };

  const doSignIn = async (e) => {
    e.preventDefault();
    const email = e.target.signinEmail.value;
    const password = e.target.signinPassword.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setSignInSuccess(`You've successfully signed in as ${userCredential.user.email}!`);
      setSignUpSuccess(null);
      setIsSignedIn(true);
      navigate('/UserDashboard');
    } catch (error) {
      setSignInSuccess(`There was an error signing in: ${error.message}!`);
    }
  };

  const doSignOut = async () => {
    try {
      await signOut(auth);
      setIsSignedIn(false);
      navigate('/');
      setSignOutSuccess("You have successfully signed out!");
    } catch (error) {
      setSignOutSuccess(`There was an error signing out: ${error.message}!`);
    }
  };

  return (
    <React.Fragment>
      {!isSignInHidden && !isSignedIn && <h1>Sign In</h1>}
      {signInSuccess}
      {!showSignUp && !isSignedIn && (
        <form onSubmit={doSignIn}>
          <input
            type='text'
            name='signinEmail'
            placeholder='email' />
          <br />
          <input
            type='password'
            name='signinPassword'
            placeholder='password' />
          <br />
          <button type='submit'>Sign In</button>
        </form>
      )}

      {!isSignedIn && (showSignUp || isSignedIn) ? null : (
        <React.Fragment>
          <h1>Sign Out</h1>
          {signOutSuccess}
          <br />
          <button onClick={doSignOut}>Sign out</button>
        </React.Fragment>
      )}

      <h4>Don't have an account?</h4>

      <button onClick={toggleSignInAndOutVisibility}>
        {showSignUp ? "Return to Sign In" : "Create an account"}
      </button>
      {showSignUp && (
        <form onSubmit={doSignUp}>
          {signUpSuccess}
          <input
            type='text'
            name='email'
            placeholder="email" />
          <br />
          <input
            type='text'
            name='username'
            placeholder="Username" />
          <br />
          <input
            type='text'
            name='city'
            placeholder="City" />
          <br />
          <label>
            Profile Image:
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
          <br />
          <label>
            <input
              minLength="6"
              type='password'
              name='password'
              placeholder="Password" />
          </label>
          <br />
          <button type="submit">Sign up</button>
        </form>
      )}
    </React.Fragment>
  );
}

export default SignIn;