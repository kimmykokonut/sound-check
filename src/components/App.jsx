import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Browse from "./Browse";
import Footer from "./Footer";
import SignIn from "./Home";
import Search from "./Search";
//import DashBoard from "./Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/browse" element={<Browse />} />
        {/* <Route path="/dashBoard" element={<DashBoard />} /> */}
        <Route path="/Search" element={<Search />} />
      </Routes>
      <Footer />
    </Router>
  );
}
export default App