import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';

export const UserDashboard = () => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [results, setResults] = useState([]);
    const [band, setBand] = useState('');
    const [displayName, setDisplayName] = useState('');

    const handleInputChange = (event) => {
        setBand(event.target.value);
    };

    const followedBands = {
        0: "Radiohead",
        1: "Dinosaur Jr",
        2: "Pixies",
        3: "Dessa",
        4: "Sleater-Kinney",
        5: "Smashing Pumpkins",
        6: "Blink-182",
    }

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
            const bandKeys = Object.keys(followedBands);
    
            const fetchShowsSequentially = async (index) => {
                if (index < bandKeys.length) {
                    const bandName = followedBands[bandKeys[index]];
                    const bandResults = await fetchShows(bandName);
                    console.log(bandResults);
                    // Check if the response is empty or doesn't contain events
                    if (bandResults.length < 1) {
                        allResults.push({}); // Include an empty placeholder for this band
                    } else {
                        allResults.push(bandResults[0]);
                    }
    
                    await fetchShowsSequentially(index + 1);
                } else {
                    setResults(allResults.flat());
                    setIsLoaded(true);
                }
            };
    
            await fetchShowsSequentially(0);
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
                    setIsLoaded(true);
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
    }, [results]);

    if (!auth.currentUser) {
        return <div>Loading...</div>;
    }

    

    return (
        <>
            <div>
                <h1>Dashboard</h1>
                <h2>{displayName}</h2>
                <input
                    id='bandInput'
                    placeholder="band"
                    type="text"
                    value={band}
                    onChange={handleInputChange}
                />
                <button type="submit" onClick={fetchShowsForAllBands}>
                    Find Shows
                </button>
                <table>
                    <thead>
                        <tr>
                            <th>Band</th>
                            <th>Date</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(followedBands).map(key => (
                            <tr key={key}>
                                <td>{followedBands[key]}</td>
                                {/* You can replace these placeholders with actual data */}
                                <td>Date Placeholder</td>
                                <td>Location Placeholder</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* {results.length > 0 ? (
                    <p>{results[0].performer[0].name} is playing at {results[0].location.name} on {results[0].startDate}</p>
                ) : (
                    <p>None</p>
                )} */}
            </div>
        </>
    );
};