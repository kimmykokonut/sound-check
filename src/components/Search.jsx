import { useState, useEffect } from "react";

function Search() {
  const [access_token, setAccessToken] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + import.meta.env.VITE_CLIENT_ID + '&client_secret=' + import.meta.env.VITE_CLIENT_SECRET
    };

    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => {
        setAccessToken(data.access_token);
      });
  }, []);

  const searchSpotify = async () => {
    const getArtistsParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
      }
    };

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=artist&limit=10`, getArtistsParams);
      const data = await response.json();
      setArtists(data.artists.items);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchInput = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await searchSpotify();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='Search for artists' onChange={handleSearchInput} />
        <button type='submit'>Search</button>
      </form>

      <div>
        <h2>Results:</h2>
        <ul>
          {artists.map(artist => (
            <li key={artist.id}>{artist.name}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Search;