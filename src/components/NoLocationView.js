import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';

export default function NoLocationView({ onRetry }) {
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.title}>Acceso a ubicación denegado</Text>
      <Text style={styles.message}>
        Esta app necesita tu ubicación para mostrar las ciudades cercanas. Activa el
        permiso desde la configuración de tu dispositivo.
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={openSettings} activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>Abrir configuración</Text>
      </TouchableOpacity>

      {onRetry && (
        <TouchableOpacity style={styles.secondaryButton} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.secondaryButtonText}>Ya lo activé — Reintentar</Text>
        </TouchableOpacity>
      )}

      <View style={styles.steps}>
        <Text style={styles.stepsTitle}>Cómo activarlo</Text>
        {Platform.OS === 'ios' ? (
          <>
            <StepRow n="1" text='Ve a Configuración → esta app' />
            <StepRow n="2" text='Toca "Ubicación"' />
            <StepRow n="3" text='Selecciona "Al usar la app"' />
          </>
        ) : (
          <>
            <StepRow n="1" text='Ve a Configuración → Aplicaciones' />
            <StepRow n="2" text='Selecciona esta app → Permisos' />
            <StepRow n="3" text='Activa "Ubicación"' />
          </>
        )}
      </View>
    </View>
  );
}

function StepRow({ n, text }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
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
  primaryButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: '#1a73e8',
    paddingHorizontal: 36,
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#1a73e8', fontWeight: '600', fontSize: 15 },
  steps: {
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
  stepsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#1a73e8' },
  stepText: { fontSize: 14, color: '#555', flex: 1 },
});
