import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail} from "firebase/auth";
import { TextField, FormControl, InputLabel, MenuItem, Select, Button, Input,  styled} from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { geoStateIso } from "../city-state-data";
import { useNavigate } from 'react-router-dom';
import { auth } from './../firebase';
import './SignIn.css';


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const CustomFileInput = ({ onChange }) => {
  return (
    <React.Fragment>
      <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
        Upload File
        <VisuallyHiddenInput type="file" onChange={onChange} />
      </Button>
    </React.Fragment>
  );
};

function SignIn() {
  const [state, setState] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signInSuccess, setSignInSuccess] = useState(null);
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
             <TextField
            type='text'
            name='signinEmail'
            placeholder='email' />
          <br />
          <TextField
            type='password'
            name='signinPassword'
            placeholder='password' />
          <br />
          <Button variant="outlined" type='submit'>Sign In</Button>
          <br />
          <Button variant="outlined" type="button" onClick={doGoogleSignIn}>Sign in with Google</Button>
        </form>
      )}

      {!isSignedIn && (
        <div>
          <br />
          <p onClick={toggleForgotPassword}><a>Forgot Password?</a></p>
          {showForgotPassword && (
            <div>

              <Input
                type="text"
                name="resetEmail"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}/>
              <br />
              <Button type="button" variant="contained" onClick={doPasswordReset}>
                Reset Password
              </Button>
              {resetSuccess && <p>{resetSuccess}</p>}
            </div>
          )}
        </div>
      )}

      <h4 style={{ display: isCreateAccountTextHidden ? 'none' : 'block' }}> <hr />Don't have an account?
      </h4>
      <Button id="createAccountButton" variant="contained" onClick={toggleSignInAndOutVisibility}>
        {showSignUp ? "Return to Sign In" : "Create an account"}
      </Button>
      {showSignUp && (
        <form onSubmit={doSignUp}>
          {signUpSuccess}
          <h4>Create Profile</h4>
          <TextField
            type='text'
            name='email'
            placeholder="email" />
          <br />
          <TextField
            type='text'
            name='username'
            placeholder="Username" />
          <br />
          <TextField
              minLength="6"
              type='password'
              name='password'
              placeholder="Password" />
          < br/>
          <TextField
            type='text'
            name='city'
            placeholder="City" />
          <br />
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel htmlFor="state">State</InputLabel>
            <Select
              labelId="state-label"
              id="state"
              name="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              label="State">
              {Object.keys(geoStateIso).map((key) => (
                <MenuItem key={key} value={key}>
                  {geoStateIso[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
            <br />
            Profile Image:
            < br />
            <CustomFileInput type="file" accept="image/*"onChange={handleImageChange} />
          <br />
          <div id="signUp">
            <Button id="signUpButton" variant="contained" type="submit">Sign up</Button>
          </div>
          <p><b>OR</b></p>
          <Button type="button" variant="contained" onClick={doGoogleSignIn}>Sign up with Google</Button>
        </form>
      )}
    </React.Fragment>
  );
}

export default SignIn;