import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LinkTelegram from "./pages/LinkTelegram";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/link-telegram" element={<LinkTelegram />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/settings" element={<SettingsPage  />} /> 
      </Routes>
    </Router>
  );
}

export default App;
