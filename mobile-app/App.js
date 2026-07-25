import React, { useState } from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { setAuthToken } from './src/services/api';

LogBox.ignoreLogs(['Request to']);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = ({ user, token }) => {
    if (token) {
      setAuthToken(token); // Send token to api.js for all backend requests
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setAuthToken(null); // Clear token on logout
    setIsLoggedIn(false);
  };

  return isLoggedIn ? (
    <AppNavigator onLogout={handleLogout} />
  ) : (
    <LoginScreen onLoginSuccess={handleLoginSuccess} />
  );
}