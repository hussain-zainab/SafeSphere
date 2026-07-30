import React, { useState, useEffect } from 'react';
import { LogBox, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { setAuthToken } from './src/services/api';

LogBox.ignoreLogs(['Request to']);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Web par PURE APP ke sare @expo/vector-icons (Ionicons) load karne ka direct CSS fix
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Create link element for Ionicons CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/ionicons@5.5.2/dist/css/ionicons.min.css';
      document.head.appendChild(link);

      // Inject @font-face override for React Native Vector Icons font family
      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(
        document.createTextNode(`
          @font-face {
            font-family: 'Ionicons';
            src: url('https://unpkg.com/ionicons@5.5.2/dist/fonts/ionicons.ttf') format('truetype');
          }
        `)
      );
      document.head.appendChild(style);
    }
  }, []);

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