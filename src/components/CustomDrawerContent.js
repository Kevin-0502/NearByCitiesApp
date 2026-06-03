import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useCountries } from '../context/CountriesContext';
import { CONTINENTS } from '../config/continents';

export default function CustomDrawerContent(props) {
  const { state, navigation } = props;
  const { countries } = useCountries();
  const activeRouteName = state.routes[state.index]?.name;

  const getCount = (continentValue) => {
    if (!continentValue) return countries.length;
    return countries.filter((c) => c.continents?.includes(continentValue)).length;
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContent}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🌍</Text>
        <Text style={styles.headerTitle}>Países del Mundo</Text>
        <Text style={styles.headerSubtitle}>{countries.length} países en total</Text>
      </View>

      {/* Separador */}
      <View style={styles.divider} />

      {/* Items de continentes */}
      {CONTINENTS.map((continent) => {
        const isActive = activeRouteName === continent.routeName;
        const count = getCount(continent.value);

        return (
          <TouchableOpacity
            key={continent.routeName}
            style={[styles.item, isActive && styles.itemActive]}
            onPress={() => navigation.navigate(continent.routeName)}
            activeOpacity={0.7}
          >
            <Text style={styles.itemIcon}>{continent.icon}</Text>
            <Text
              style={[styles.itemLabel, isActive && styles.itemLabelActive]}
              numberOfLines={1}
            >
              {continent.label}
            </Text>
            <View style={[styles.badge, isActive && styles.badgeActive]}>
              <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                {count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },

  /* Header */
  header: {
    backgroundColor: '#1a73e8',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },

  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },

  /* Items */
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
    marginHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  itemActive: {
    backgroundColor: '#e8f0fe',
  },
  itemIcon: {
    fontSize: 22,
    width: 34,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  itemLabelActive: {
    color: '#1a73e8',
    fontWeight: '700',
  },

  /* Badge con conteo */
  badge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 30,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: '#1a73e8',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  badgeTextActive: {
    color: '#fff',
  },
});
