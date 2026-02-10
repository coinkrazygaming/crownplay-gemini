
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import LobbyPage from './pages/LobbyPage';
import ShopPage from './pages/ShopPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import RedeemPage from './pages/RedeemPage';
import AdminDashboard from './pages/AdminDashboard';
import GamePage from './pages/GamePage';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/redeem" element={<RedeemPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
};

export default App;
