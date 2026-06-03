import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Text,
  RefreshControl,
  StatusBar,
} from 'react-native';
import CountryCard from '../components/CountryCard';
import LoadingView from '../components/LoadingView';
import ErrorView from '../components/ErrorView';
import { useCountries } from '../context/CountriesContext';

export default function CountriesScreen({ navigation, route }) {
  const { countries, loading, error, reload } = useCountries();
  const continent = route.params?.continent ?? null;
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const baseList = useMemo(() => {
    if (!continent) return countries;
    return countries.filter((c) => c.continents?.includes(continent));
  }, [countries, continent]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter(
      (c) =>
        c.name?.common?.toLowerCase().includes(q) ||
        c.capital?.[0]?.toLowerCase().includes(q)
    );
  }, [baseList, search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingView message="Cargando países del mundo..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={reload} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por país o capital..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>
      <Text style={styles.count}>
        {filtered.length} {filtered.length === 1 ? 'país' : 'países'}
      </Text>
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => item.name?.common ?? String(index)}
        renderItem={({ item }) => (
          <CountryCard
            country={item}
            onPress={() =>
              navigation.navigate('CountryDetail', { country: item })
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1a73e8']}
            tintColor="#1a73e8"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              {search.trim()
                ? `No se encontraron países para "${search}"`
                : 'No hay países en este continente'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  searchContainer: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  count: {
    fontSize: 13,
    color: '#888',
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 2,
  },
  listContent: { paddingTop: 6, paddingBottom: 24 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#aaa', fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
});
