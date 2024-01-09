import { json } from "react-router-dom";

//get ID
export function getCityId(city, state) {
  return fetch(`https://www.jambase.com/jb-api/v1/geographies/cities?geoCityName=${city}&geoStateIso=${state}&apikey=${import.meta.env.VITE_REACT_APP_JAMBASE}`, {
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
      const result = jsonifiedResponse.cities[0].identifier; 
      return result;
    })
    .catch((error) => {
      console.error('Error:', error);
      return error;
    });
}
//get show by ID
export function getShowsById(jamID) {
  return fetch(`https://www.jambase.com/jb-api/v1/events?perPage=5&geoCityId=${jamID}&apikey=${import.meta.env.VITE_REACT_APP_JAMBASE}`, {
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
      const result = jsonifiedResponse.events;
      console.log(result);
      return result; //???
    })
    .catch((error) => {
      console.error('Error:', error);
      return error;
    });
}