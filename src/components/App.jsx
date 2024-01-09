import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Browse from "./Browse";
import Footer from "./Footer";
import SignIn from "./Home";
import Search from "./Search";
import DashBoard from "./Dashboard";
import Forum from "./Forum/Forum";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/dashBoard" element={<DashBoard />} />
        <Route path="/Search" element={<Search />} />
        <Route path="/forum" element={<Forum />} />
      </Routes>
      <Footer />
      
    </Router>
  );
}
export default App