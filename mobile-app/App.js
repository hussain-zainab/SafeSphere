import React, { useState } from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';

LogBox.ignoreLogs(['Request to']);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => setIsLoggedIn(false);

  return isLoggedIn ? (
    <AppNavigator onLogout={handleLogout} />
  ) : (
    <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />
  );
}