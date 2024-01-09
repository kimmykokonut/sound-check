function UserDashboard() {

  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [results, setResults] = useState([]);

  const fetchShows = async () => {
    try {
        const response = await fetch('https://www.jambase.com/jb-api/v1/events?artistName=dinosaur+jr&geoCityId=jambase%3A4247192&apikey=08a8d2c1-e4c2-4681-bb15-e2ca6ca74647');
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }
        const jsonifiedresponse = await response.json();
        return jsonifiedresponse.events;
    } catch (error) {
        throw new Error(error.message);
    }
};

useEffect(() => {
    if (results.length === 0) {
        fetchShows()
            .then(newResults => {
                setHands(newResults);
                setIsLoaded(true);
            })
            .catch(error => {
                setError(error.message);
                setIsLoaded(true);
            });
    }
}, [results]);

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
export default UserDashboard;