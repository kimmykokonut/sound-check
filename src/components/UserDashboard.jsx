import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { getFirestore, collection, doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export const UserDashboard = () => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [results, setResults] = useState([]);
    const [band, setBand] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [artistArray, setArtistArray] = useState([]);

    const followedBands = {
        0: "Radiohead",
        1: "Dinosaur Jr",
        2: "Pixies",
        3: "Dessa",
        4: "Sleater-Kinney",
        5: "Smashing Pumpkins",
        6: "Blink-182",
    }

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
                            setArtistArray(userData.followedArtists || []);
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

    const fetchShows = async (bandName) => {
        try {
            const response = await fetch(`https://www.jambase.com/jb-api/v1/events?artistName=${bandName}&geoCityId=jambase%3A4247192&apikey=${import.meta.env.VITE_REACT_APP_JAMBASE}`);
            if (!response.ok) {
                throw new Error(`${response.status}: ${response.statusText}`);
            }
            const jsonifiedresponse = await response.json();
            return jsonifiedresponse.events;
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const fetchShowsForAllBands = async () => {
        try {
            setIsLoaded(false);
            const allResults = [];

            const fetchShowsForArtist = async (artistName) => {
                try {
                    const bandResults = await fetchShows(artistName);
                    if (bandResults.length < 1) {
                        allResults.push({});
                    } else {
                        allResults.push(bandResults[0]);
                    }
                } catch (error) {
                    setError(error.message);
                }
            };
            for (const artist of artistArray) {
                await fetchShowsForArtist(artist);
            }

            setResults(allResults.flat());
            setIsLoaded(true);
        } catch (error) {
            setError(error.message);
            setIsLoaded(true);
        }
    };

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
                setIsLoaded(true);
            }
        };
        checkCurrentUser();
    }, []);

    useEffect(() => {
        console.log(results);
        console.log(artistArray)
    }, [results]);

    useEffect(() => {
        fetchShowsForAllBands();
    }, [artistArray]);

    if (!auth.currentUser) {
        return <div>Loading...</div>;
    }

    const formatDate = (dateString) => {
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        const dateTime = new Date(dateString);
        return dateTime.toLocaleDateString('en-US', options);
    };

    return (
        <>
            <div>
                <h1>Dashboard</h1>
                <h2>{displayName}</h2>
                {isLoaded ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Band</th>
                                <th>Date</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artistArray.map((artist, index) => {
                                const bandResult = results[index] || {};
                                const formattedDate = bandResult.startDate ? formatDate(bandResult.startDate) : 'N/A';
                                return (
                                    <tr key={index}>
                                        <td>{artist}</td>
                                        <td>{formattedDate}</td>
                                        <td>{bandResult.location ? bandResult.location.name : 'N/A'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </>
    );
};