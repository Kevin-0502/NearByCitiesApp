import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function NoInternetView({ onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.title}>Sin conexión a internet</Text>
      <Text style={styles.message}>
        No se pudo establecer conexión con el servidor. Verifica que tu Wi-Fi o datos
        móviles estén activos e intenta de nuevo.
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      )}
      <View style={styles.hints}>
        <HintRow text="Activa el Wi-Fi o los datos móviles" />
        <HintRow text="Comprueba que el modo avión esté desactivado" />
        <HintRow text="Verifica la señal de red" />
      </View>
    </View>
  );
}

function HintRow({ text }) {
  return (
    <View style={styles.hintRow}>
      <Text style={styles.hintDot}>•</Text>
      <Text style={styles.hintText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f7fa',
  },
  icon: { fontSize: 72, marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 28,
  },
  button: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 32,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hints: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hintDot: { fontSize: 18, color: '#1a73e8', marginRight: 10, lineHeight: 22 },
  hintText: { fontSize: 14, color: '#555', flex: 1, lineHeight: 22 },
});
