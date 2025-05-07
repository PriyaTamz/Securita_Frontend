import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SuperadminDashboard from './components/SuperadminDashboard';
import UserDashboard from './components/UserDashboard';
import MfaSetup from './components/MfaSetup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/superadmin-dashboard" element={<SuperadminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/user/mfa/:userId" element={<MfaSetup />} />
      </Routes>
    </Router>
  );
}

export default App;
