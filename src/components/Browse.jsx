import { useState, useEffect } from "react";

function Browse() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [eventsNearby, setEventsNearby] = useState([]);

  useEffect(() => {
    fetch(`https://www.jambase.com/jb-api/v1/events?perPage=20&geoCityId=jambase%3A4247192&apikey=${import.meta.env.VITE_REACT_APP_JAMBASE}`, {
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
        console.log(eventsNearby);
      })
      .catch((error) => {
        console.error('Error:', error);
        setError(error)
        setIsLoaded(true)
      });
  }, [])

  // function handleForm(){
// have api call connected to either user input city or user aut set city....
  // }

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
            placeholder="my location..."
            type="text"></input>
          <button type="submit">show me shows near me</button>
        </form>
        <hr />
        <h3>Who's coming to Portland?</h3>
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
              <a href={show.offers[0].url}>link to venue</a>
              <hr />
            </li>
          )}
        </ul>
      </>
    );
  }
}
export default Browse;