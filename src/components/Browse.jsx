import { useState, useEffect } from "react";
import { geoStateIso } from "../city-state-data";
import { getCityId, getShowsById } from "../fetchData";

function Browse() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [eventsNearby, setEventsNearby] = useState([]);
  const [selectedState, setSelectedState] = useState('US-AL'); //want 'US-NY'
  const [selectCity, setSelectCity] = useState('Portland');

  useEffect(() => { //this is for Portland OR API call
    fetch(`https://www.jambase.com/jb-api/v1/events?perPage=5&geoCityId=jambase%3A4247192&apikey=${import.meta.env.VITE_REACT_APP_JAMBASE}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        } else {
          return response.json()
        }
      })
      .then((jsonifiedResponse) => {
        setEventsNearby(jsonifiedResponse.events)
        setIsLoaded(true)
        console.log(jsonifiedResponse.events);
      })
      .catch((error) => {
        console.error('Error:', error);
        setError(error)
        setIsLoaded(true)
      });
  }, [])

  async function handleClick(e) {
    e.preventDefault();
    console.log(selectCity, selectedState);
    const jamID = await getCityId(selectCity, selectedState);
    console.log(jamID);
    const finalResult = getShowsById(jamID);
    setEventsNearby(finalResult);
    console.log(eventsNearby);
    //want this to go in return
  }

  function handleChange(e) {
    if (e.target.name === 'state') {
      console.log(e.target.name);
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
    return (
      <>
        <h1>Let's go check some sounds!</h1>
        <form>
          <input
            name="city"
            placeholder="my city..."
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
          <button onClick={handleClick}>show me shows near me</button>
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
              <button>wanna go - add to my dashboard</button>
              <hr />
            </li>
          )}
        </ul>
      </>
    );
  }
}
export default Browse;