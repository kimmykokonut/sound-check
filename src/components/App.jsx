import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Browse from "./Browse";
import Footer from "./Footer";
import SignIn from "./Home";
import Search from "./Search";
import Forum from "./Forum/Forum";
import { UserDashboard } from "./UserDashboard";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/Search" element={<Search />} />
        <Route path="/userDashboard" element={<UserDashboard />} />
      </Routes>
      <Footer />
      
    </Router>
  );
}
export default App
