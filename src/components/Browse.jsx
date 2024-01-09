import { useState, useEffect } from "react";
import { geoStateIso } from "../city-state-data";
import { getCityId, getShowsById } from "../fetchData";
import { useNavigate } from "react-router-dom";
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';


function Browse() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [eventsNearby, setEventsNearby] = useState([]);
  const [selectedState, setSelectedState] = useState('US-AL');
  const [selectCity, setSelectCity] = useState('Portland');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        auth.onAuthStateChanged((user) => {
          if (user) {
            setDisplayName(user.email || '');
          }
        });
      } catch (error) {
        setError(error.message);
        //setIsLoaded(true);
      }
    };

    checkCurrentUser();
  }, []);

  //this currently defaults to Pdx shows until we can get user db input state as 'US-CT' format
  useEffect(() => {
    const fetchData = async () => {
      try {
        auth.onAuthStateChanged(async (user) => {
          if (user) {
            setDisplayName(user.email || '');
            const userId = user.uid;
            const userRef = doc(db, 'users', userId);
            const userSnapshot = await getDoc(userRef);
            console.log(userSnapshot);

            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
              console.log(userData.city);
              //call api call by city/state here?
              //add to city once state is set: userData.city ||
              const city = 'Portland'
              setSelectCity(city);
              const state = userData.state || 'US-OR';
              setSelectedState(state);
              const jamID = await getCityId(city, state);
              const finalResult = await getShowsById(jamID);
              setEventsNearby(finalResult);
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

  // useEffect(() => { //this is for Portland OR API call
  //   fetch(`https://www.jambase.com/jb-api/v1/events?perPage=5&geoCityId=jambase%3A4247192&apikey=${import.meta.env.VITE_REACT_APP_JAMBASE}`, {
  //     method: 'GET',
  //     headers: {
  //       'Accept': 'application/json',
  //     },
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error(`${response.status}: ${response.statusText}`);
  //       } else {
  //         return response.json()
  //       }
  //     })
  //     .then((jsonifiedResponse) => {
  //       setEventsNearby(jsonifiedResponse.events)
  //       setIsLoaded(true)
  //     })
  //     .catch((error) => {
  //       setError(error)
  //       setIsLoaded(true)
  //     });
  // }, [])

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

  if (error) {
    return <h1>Error: {error}</h1>;
  } else if (!isLoaded) {
    return <h1>...Loading...</h1>;
  } else {
    if (eventsNearby) {
      return (
        <>
          <h1>Let's go check some sounds!</h1>
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
            <button onClick={handleClick}>show me shows</button>
          </form>
          <hr />
          <h3>Who's coming to {selectCity}?</h3>
          <ul>
            {eventsNearby && eventsNearby.map((show, index) =>
              <li key={index}>
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
                <button>Follow</button>
                <hr />
              </li>
            )}
          </ul>
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