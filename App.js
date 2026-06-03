import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import NearbyNavigator from './src/navigation/NearbyNavigator';
import CountriesNavigator from './src/navigation/CountriesNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <NearbyNavigator />
    </NavigationContainer>
  );
}
