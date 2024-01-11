import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { geoStateIso } from "../city-state-data";
import { useNavigate } from 'react-router-dom';
import { auth } from './../firebase';
import './SignIn.css';


function SignIn() {
  const [signUpSuccess, setSignUpSuccess] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signInSuccess, setSignInSuccess] = useState(null);
  const [signOutSuccess, setSignOutSuccess] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isSignInHidden, setIsSignInHidden] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isCreateAccountTextHidden, setIsCreateAccountTextHidden] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const toggleSignInAndOutVisibility = () => {
    setShowSignUp(!showSignUp);
    setIsSignInHidden(!isSignInHidden);
    setIsCreateAccountTextHidden(!isCreateAccountTextHidden);
    setShowForgotPassword(false);
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
    const state = e.target.state.value;

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
        await setDoc(userDocRef, { username, city, profileImage: imageUrl, state });
      } else {
        await setDoc(userDocRef, { username, city, state });
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

  const doGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider);
      setSignInSuccess(`You've successfully signed in with Google as ${userCredential.user.email}!`);
      setSignUpSuccess(null);
      setIsSignedIn(true);
      navigate('/UserDashboard');
    } catch (error) {
      setSignInSuccess(`There was an error signing in with Google: ${error.message}!`);
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

  const doPasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess("Password reset email sent. Check your inbox!");
    } catch (error) {
      setResetSuccess(`Error sending reset email: ${error.message}`);
    }
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
  };

  return (
    <React.Fragment>
      {!isSignInHidden && !isSignedIn && !showForgotPassword && <h1>Sign In</h1>}
      {signInSuccess}
      {!showSignUp && !isSignedIn && !showForgotPassword && (
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
          <br />
          <button type="button" onClick={doGoogleSignIn}>Sign in with Google</button>
        </form>
      )}

      {!isSignedIn && (
        <div>
          <br />
          <p onClick={toggleForgotPassword}><a>Forgot Password?</a></p>
          {showForgotPassword && (
            <div>

              <input
                type="text"
                name="resetEmail"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <br />
              <button type="button" onClick={doPasswordReset}>
                Reset Password
              </button>
              {resetSuccess && <p>{resetSuccess}</p>}
            </div>
          )}
        </div>
      )}

      <div id="signOutButton">
        {!isSignedIn && (
          <React.Fragment>
            {signOutSuccess}
            <br />
            <button onClick={doSignOut}>Sign out</button>
          </React.Fragment>
        )}
      </div>

      <h4 style={{ display: isCreateAccountTextHidden ? 'none' : 'block' }}> <hr />Don't have an account?
      </h4>
      <button id="createAccountButton" onClick={toggleSignInAndOutVisibility}>
        {showSignUp ? "Return to Sign In" : "Create an account"}
      </button>
      {showSignUp && (
        <form onSubmit={doSignUp}>
          {signUpSuccess}
          <h4>Create Profile</h4>
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
          <label htmlFor="state">State: </label>
          <select id="state" name="state">
            {Object.keys(geoStateIso).map(key => {
              return (
                <option name="state" value={key} key={key}>{geoStateIso[key]}
                </option>
              );
            })};
          </select>
          <label>
            <br />
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
          <div id="signUp">
            <button id="signUpButton" type="submit">Sign up</button>
          </div>
          <p><b>OR</b></p>
          <button type="button" onClick={doGoogleSignIn}>Sign up with Google</button>
        </form>
      )}
    </React.Fragment>
  );
}

export default SignIn;