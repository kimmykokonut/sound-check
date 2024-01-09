import React, { useState, useEffect } from 'react';

export const UserDashboard = () => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [results, setResults] = useState([]);
    const [band, setBand] = useState('');

    const handleInputChange = (event) => {
        setBand(event.target.value);
    };

    const fetchShows = async () => {
        try {
            const response = await fetch(`https://www.jambase.com/jb-api/v1/events?artistName=${band}&geoCityId=jambase%3A4247192&apikey=08a8d2c1-e4c2-4681-bb15-e2ca6ca74647`);
            if (!response.ok) {
                throw new Error(`${response.status}: ${response.statusText}`);
            }
            const jsonifiedresponse = await response.json();
            return jsonifiedresponse.events;
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const handleSubmit = () => {
        // Trigger the API call only when the band is not empty
        if (band.trim() !== '') {
            fetchShows()
                .then(newResults => {
                    setResults(newResults);
                    setIsLoaded(true);
                })
                .catch(error => {
                    setError(error.message);
                    setIsLoaded(true);
                });
        }
    };

    useEffect(() => {
        console.log(results);
    }, [results]);

    return (
        <>
            <div>
                <h1>Dashboard</h1>
                <input
                    id='bandInput'
                    placeholder="band"
                    type="text"
                    value={band}
                    onChange={handleInputChange}
                />
                <button type="submit" onClick={handleSubmit}>
                    Find Shows
                </button>
                {results.length > 0 ? (
                    <p>{results[0].performer[0].name} is playing at {results[0].location.name} on {results[0].startDate}</p>
                ) : (
                    <p>None</p>
                )}
            </div>
        </>
    );
};