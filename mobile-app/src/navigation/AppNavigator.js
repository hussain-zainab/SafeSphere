import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ReportScreen from '../screens/ReportScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SOSButton from '../components/SOSButton';

const Tab = createBottomTabNavigator();

export default function AppNavigator({ onLogout }) {
  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            tabBarActiveTintColor: '#6C4CE0',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarStyle: {
              paddingBottom: 6,
              paddingTop: 6,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            tabBarIcon: ({ color, size, focused }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Map') {
                iconName = focused ? 'map' : 'map-outline';
              } else if (route.name === 'Report') {
                iconName = focused ? 'alert-circle' : 'alert-circle-outline';
              } else if (route.name === 'History') {
                iconName = focused ? 'time' : 'time-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Report" component={ReportScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="Profile">
            {() => <ProfileScreen onLogout={onLogout} />}
          </Tab.Screen>
        </Tab.Navigator>
        <SOSButton />
      </View>
    </NavigationContainer>
  );
}