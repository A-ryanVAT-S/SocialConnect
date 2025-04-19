import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import TweetDetail from './pages/TweetDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Polls from './pages/Polls';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetails';
import Messages from './pages/Messages';
import Users from './pages/Users';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Check for stored user on load
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-900 text-gray-100">
        {currentUser && <Sidebar user={currentUser} onLogout={handleLogout} />}
        
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/login" element={
              currentUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/register" element={
              currentUser ? <Navigate to="/" /> : <Register onLogin={handleLogin} />
            } />
            
            {/* Protected routes */}
            <Route path="/" element={
              currentUser ? <Feed username={currentUser.username} /> : <Navigate to="/login" />
            } />
            <Route path="/profile/:username" element={
              currentUser ? <Profile currentUser={currentUser} /> : <Navigate to="/login" />
            } />
            <Route path="/tweet/:tweetId" element={
              currentUser ? <TweetDetail currentUser={currentUser} /> : <Navigate to="/login" />
            } />
            <Route path="/polls" element={
              currentUser ? <Polls currentUser={currentUser} /> : <Navigate to="/login" />
            } />
            <Route path="/groups" element={
              currentUser ? <Groups currentUser={currentUser} /> : <Navigate to="/login" />
            } />
            <Route path="/group/:groupName" element={
              currentUser ? <GroupDetail currentUser={currentUser} /> : <Navigate to="/login" />
            } />
            <Route path="/messages/:receiverUsername" element={
              currentUser ? <Messages currentUser={currentUser} /> : <Navigate to="/login" />
            } />
            <Route path="/messages" element={
              currentUser ? <Messages currentUser={currentUser} /> : <Navigate to="/login" />
            } />
            { <Route path="/users" element={
              currentUser ? <Users currentUser={currentUser} /> : <Navigate to="/login" />
            } /> }
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;