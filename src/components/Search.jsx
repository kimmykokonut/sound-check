import { useState, useEffect } from "react";
import { auth, db } from '../firebase';
import { getFirestore, collection, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';


function Search() {
  const [access_token, setAccessToken] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [artists, setArtists] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [followingArtists, setFollowingArtists] = useState([]);

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

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        auth.onAuthStateChanged((user) => {
          if (user) {
            setDisplayName(user.uid || '');
          }
        });
      } catch (error) {
        setError(error.message);
        setIsLoaded(true);
      }
    };

    checkCurrentUser();
  }, []);

  const handleFollow = async (artistName) => {
    try {
      const userId = displayName;
      const userRef = doc(db, 'users', userId);
    
      await updateDoc(userRef, {
        followedArtists: arrayUnion(artistName)
      });
      setFollowingArtists(prevState => [...prevState, artistName]);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
      } else {
        console.log("User not found!");
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleUnfollow = async (artistName) => {
    try {
      const userId = displayName;
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        followedArtists: arrayRemove(artistName)
      });
      setFollowingArtists(prevState => prevState.filter(name => name !== artistName));
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
      } else {
        console.log("User not found!");
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  useEffect(() => {
    const fetchFollowingArtists = async () => {
      try {
        const userId = displayName;
        const userRef = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setFollowingArtists(userData.followedArtists || []);
        }
      } catch (error) {
        console.error('Error fetching followed artists:', error);
      }
    };
  
    fetchFollowingArtists();
  }, [displayName]);

  const isFollowing = (artistName) => {
    return followingArtists.includes(artistName);
  };

  const handleButtonClick = (artistName) => {
    if (isFollowing(artistName)) {
      handleUnfollow(artistName);
    } else {
      handleFollow(artistName);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='Search for artists' onChange={handleSearchInput} />
        <button type='submit'>Search</button>
      </form>

      <div>
        <h2>Results:</h2>
        <table>
          <thead>
            <tr>
              <th>Artist</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {artists.map(artist => (
              <tr key={artist.id}>
              <td>{artist.name}</td>
              <td>
                <button onClick={() => handleButtonClick(artist.name)}>
                  {isFollowing(artist.name) ? 'Unfollow' : 'Follow'}
                </button>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Search;