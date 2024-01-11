import { useState, useEffect } from "react";
import { geoStateIso } from "../city-state-data";
import { getCityId, getShowsById } from "../fetchData";
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Card, CardContent, CardMedia, Button, CardActions, Container, Grid, Typography, FormControl, Input, Select, MenuItem, InputLabel, TextField } from '@mui/material';

function Browse() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [eventsNearby, setEventsNearby] = useState([]);
  const [selectedState, setSelectedState] = useState('US-AL');
  const [selectCity, setSelectCity] = useState('Portland');
  const [displayName, setDisplayName] = useState('');
  const [followingArtists, setFollowingArtists] = useState([]);


  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        auth.onAuthStateChanged((user) => {
          if (user) {
            setDisplayName(user.email || '');
            const userId = user.uid;
          }
        });
      } catch (error) {
        setError(error.message);
        setIsLoaded(true);
      }
    };
    checkCurrentUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        auth.onAuthStateChanged(async (user) => {
          if (user) {
            setDisplayName(user.email || '');
            const userId = user.uid;
            const userRef = doc(db, 'users', userId);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
              const city = userData.city || 'Portland';
              setSelectCity(city);
              const state = userData.state || 'US-OR';
              setSelectedState(state);
              const jamID = await getCityId(city, state);
              const finalResult = await getShowsById(jamID);
              setEventsNearby(finalResult);
            } else {
              setError("User not found!");
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

  async function handleClick(e) {
    e.preventDefault();
    const jamID = await getCityId(selectCity, selectedState);
    const finalResult = await getShowsById(jamID);
    setEventsNearby(finalResult);
  }

  function handleChange(e) {
    if (e.target.name === 'state') {
      setSelectedState(e.target.value);
    } else if (e.target.name === 'city') {
      setSelectCity(e.target.value);
    }
  }

  const handleFollow = async (artistName) => {
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        followedArtists: arrayUnion(artistName)
      });
      setFollowingArtists(prevState => [...prevState, artistName]);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
      } else {
        setError("User not found!");
      }
    } catch (error) {
      setError('Error updating document:', error);
    }
  };

  const handleUnfollow = async (artistName) => {
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        followedArtists: arrayRemove(artistName)
      });
      setFollowingArtists(prevState => prevState.filter(name => name !== artistName));
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
      } else {
        setError("User not found!");
      }
    } catch (error) {
      setError('Error updating document:', error);
    }
  };

  function isFollowing(artistName) {
    return followingArtists.includes(artistName);
  }

  if (error) {
    return <h1>Error: {error}</h1>;
  } else if (!isLoaded) {
    return <h1>...Loading...</h1>;
  } else {
    if (eventsNearby) {
      return (
        <>
          <Container>
            <Typography variant="subtitle2" align="right">signed in: {displayName}</Typography>
            <Grid container>
              <Grid item xs={12} sm={2}>
                <TextField
                  required
                  size="small"
                  name="city"
                  placeholder="city name..."
                  type="text"
                  onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  required
                  size="small"
                  select
                  label="State"
                  id="state"
                  name="state"
                  value={selectedState}
                  onChange={handleChange}>
                  {Object.keys(geoStateIso).map(key => {
                    return (
                      <MenuItem name="state" value={key} key={key}>{geoStateIso[key]}
                      </MenuItem>
                    );
                  })};
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button onClick={handleClick}>show me</Button>
              </Grid >
            </Grid >
          </Container >
          <hr />
          <Container sx={{ py: 2 }} justifyContent="center" maxWidth="lg">
            <Typography component="h1"
              variant="h3"
              align="center"
              color="text.primary"
              gutterBottom>Who's coming to {selectCity}?</Typography>
            <Grid container spacing={4}>
              {eventsNearby.length === 0 ? (
                <Typography variant="h6" align="center">
                  Sorry, no shows coming to {selectCity}!
                </Typography>
              ) : (
                eventsNearby.map((show, index) =>
                  <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                    <Card sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#f5f5f5'
                    }}>
                      <CardMedia
                        component='div'
                        sx={{ pt: '56.25%' }}
                        image="https://source.unsplash.com/random?wallpapers" />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5">{show.name}</Typography>
                        <Typography variant="subtitle2" gutterBottom>{
                          new Date(show.startDate).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })
                        }</Typography>
                        <Typography variant="body1">{show.location.name}</Typography>
                        <Typography variant="body1">{show.location.address.streetAddress}</Typography>
                      </CardContent>
                      <CardActions>
                        {show.offers && show.offers[0] && show.offers[0].url ? <Button href={show.offers[0].url}>venue</Button> : null}
                        <Button size="small" onClick={() => handleFollow(show.performer[0].name)}>
                          {isFollowing(show.performer[0].name) ? 'Unfollow' : 'Follow'}</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </Container>
        </>
      )
    };
  }
}
export default Browse;