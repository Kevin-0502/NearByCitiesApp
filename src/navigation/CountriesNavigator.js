import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CountriesProvider } from '../context/CountriesContext';
import { CONTINENTS } from '../config/continents';
import CountriesScreen from '../screens/CountriesScreen';
import CountryDetailScreen from '../screens/CountryDetailScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: '#1a73e8' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
  headerBackTitleVisible: false,
};

function ContinentDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        ...headerOptions,
        drawerStyle: { width: 280 },
      }}
    >
      {CONTINENTS.map((continent) => (
        <Drawer.Screen
          key={continent.routeName}
          name={continent.routeName}
          component={CountriesScreen}
          initialParams={{ continent: continent.value }}
          options={{ title: `${continent.icon} ${continent.label}` }}
        />
      ))}
    </Drawer.Navigator>
  );
}

export default function CountriesNavigator() {
  return (
    <CountriesProvider>
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen
          name="ContinentDrawer"
          component={ContinentDrawer}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CountryDetail"
          component={CountryDetailScreen}
          options={({ route }) => ({
            title: route.params?.country?.name?.common ?? 'Detalle',
          })}
        />
      </Stack.Navigator>
    </CountriesProvider>
  );
}
