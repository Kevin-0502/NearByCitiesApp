import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NearbyProvider } from '../context/NearbyContext';
import NearbyScreen from '../screens/NearbyScreen';
import NearbyMapScreen from '../screens/NearbyMapScreen';
import CityDetailScreen from '../screens/CityDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: '#1a73e8' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
  headerBackTitleVisible: false,
};

function NearbyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...headerOptions,
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { borderTopColor: '#eee' },
      }}
    >
      <Tab.Screen
        name="Lista"
        component={NearbyScreen}
        options={{
          title: '📍 Ciudades Cercanas',
          tabBarLabel: 'Lista',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>☰</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Mapa"
        component={NearbyMapScreen}
        options={{
          title: '🗺 Mapa de Ciudades',
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>🗺</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function NearbyNavigator() {
  return (
    <NearbyProvider>
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen
          name="NearbyTabs"
          component={NearbyTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CityDetail"
          component={CityDetailScreen}
          options={({ route }) => ({
            title: route.params?.city?.name ?? 'Detalle',
          })}
        />
      </Stack.Navigator>
    </NearbyProvider>
  );
}
