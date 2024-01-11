import React, { useState } from "react";
import { TextField, Button, Link, Grid, Box, Avatar, Typography, Container, FormControlLabel, Checkbox, createTheme, ThemeProvider, Select, MenuItem, CssBaseline, FormControl, InputLabel, } from "@mui/material";
import { geoStateIso } from "../city-state-data";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore,  doc, setDoc } from "firebase/firestore";
import { auth } from "./../firebase";

const defaultTheme = createTheme();

const CustomFileInput = ({ onChange }) => {
  return (
    <React.Fragment>
      <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
        Upload File
        <input type="file" style={{ display: "none" }} onChange={onChange} />
      </Button>
    </React.Fragment>
  );
};

export default function SignIn() {
  const [state, setState] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();

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
    const userState = e.target.state.value;

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
        await setDoc(userDocRef, { username, city, profileImage: imageUrl, state: userState });
      } else {
        await setDoc(userDocRef, { username, city, state: userState });
      }
      navigate('/UserDashboard');
    } catch (error) {
      // setSignUpSuccess(`There was an error signing up: ${error.message}!`);
    }
  };

  const doSignIn = async (e) => {
    e.preventDefault();
    const email = e.target.signinEmail.value;
    const password = e.target.signinPassword.value;

    try {
      signInWithEmailAndPassword(auth, email, password);
      navigate('/UserDashboard');
    } catch (error) {
      // setSignInSuccess(`There was an error signing in: ${error.message}!`);
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

  const handleForgotPassword = () => {
    setForgotPassword(!forgotPassword);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar id='avatar' sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography id="signInH1" component="h1" variant="h5">
            {showSignUp ? "Sign Up" : "Sign In"}
          </Typography>
          <Box
            component="form"
            onSubmit={showSignUp ? doSignUp : doSignIn}
            noValidate
            sx={{ mt: 1 }}
          >
            {showSignUp && (
              <>
                <TextField
                  type='text'
                  name='email'
                  placeholder='Email'
                  fullWidth
                />
                <TextField
                  type="text"
                  name="username"
                  placeholder="Username"
                  fullWidth
                />
                <TextField
                  minLength="6"
                  type="password"
                  name="password"
                  placeholder="Password"
                  fullWidth
                />
                <TextField
                  type="text"
                  name="city"
                  placeholder="City"
                  fullWidth
                />
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
                <br />
                <CustomFileInput onChange={handleImageChange} />
                <br />
              </>
            )}
            {!showSignUp && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="signinEmail"
                  label="Email Address"
                  name="signinEmail"
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="signinPassword"
                  label="Password"
                  type="password"
                  id="signinPassword"
                  autoComplete="current-password"
                />
              </>
            )}
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {showSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <Grid container>
              <Grid item xs>
                {forgotPassword ? (
                  <>
                    <TextField
                      type="text"
                      name="resetEmail"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <br />
                    <Button
                      type="button"
                      variant="contained"
                      onClick={doPasswordReset}
                    >
                      Reset Password
                    </Button>
                    {resetSuccess && <p>{resetSuccess}</p>}
                  </>
                ) : (
                  <Link href="#" variant="body2" onClick={handleForgotPassword}>
                    Forgot password?
                  </Link>
                )}
              </Grid>
              <Grid item>
                <Link
                  href="#"
                  variant="body2"
                  onClick={() => setShowSignUp(!showSignUp)}
                >
                  {showSignUp
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}