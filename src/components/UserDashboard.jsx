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
                    if (bandResults.length < 1) {
                        allResults.push({});
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


    useEffect(() => {
        fetchShowsForAllBands();
    }, []);

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
                            {Object.keys(followedBands).map((key) => {
                                const bandResult = results[key] || {};
                                const formattedDate = bandResult.startDate ? formatDate(bandResult.startDate) : 'N/A';
                                return (
                                    <tr key={key}>
                                        <td>{followedBands[key]}</td>
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