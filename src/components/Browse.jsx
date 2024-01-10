import { useState, useEffect } from "react";
import { geoStateIso } from "../city-state-data";
import { getCityId, getShowsById } from "../fetchData";
import { useNavigate } from "react-router-dom";
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

function Browse() {
  const navigate = useNavigate();
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
          <h1>soundCheck by city</h1>
          <p>signed in: {displayName}</p>
          <hr />
          <form>
            <input
              name="city"
              placeholder="city name..."
              type="text"
              onChange={handleChange}>
            </input>
            <br />
            <label htmlFor="state">State: </label>
            <select id="state" name="state" onChange={handleChange}>
              {Object.keys(geoStateIso).map(key => {
                return (
                  <option name="state" value={key} key={key}>{geoStateIso[key]}
                  </option>
                );
              })};
            </select>
            <br />
            <button onClick={handleClick}>show me</button>
          </form>
          <hr />
          <h3>Who's coming to {selectCity}?</h3>
          <hr/>
          <div>
            {eventsNearby && eventsNearby.map((show, index) =>
              <div key={index}>
                <h3>{show.name}</h3>
                <h4>{
                  new Date(show.startDate).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })
                }</h4>
                <h4>{show.location.name}</h4>
                <p>{show.location.address.streetAddress}</p>
                {show.offers && show.offers[0] && show.offers[0].url ? <a href={show.offers[0].url}>link to venue</a> : null}
                <br />
                <button onClick={() => handleFollow(show.performer[0].name)}>
                  {isFollowing(show.performer[0].name) ? 'Unfollow' : 'Follow'}</button>
                <hr />
              </div>
            )}
          </div>
          <br />
          <button onClick={() => navigate('/userDashboard')}>go to my dashboard</button>
          <hr />
          <button onClick={() => navigate('/')}>Sign Out</button>
        </>
      )
    };
  }
}
export default Browse;