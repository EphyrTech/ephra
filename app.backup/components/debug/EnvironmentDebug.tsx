import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { ENV, EnvUtils } from '../../config/env';

/**
 * Environment Debug Component
 * 
 * This component displays the current environment configuration
 * to help debug configuration issues
 */
export const EnvironmentDebug: React.FC = () => {
  const expoConfig = Constants.expoConfig?.extra || {};
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Environment Debug Info</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 App Info</Text>
        <Text style={styles.item}>App Name: {Constants.expoConfig?.name}</Text>
        <Text style={styles.item}>Version: {Constants.expoConfig?.version}</Text>
        <Text style={styles.item}>Platform: {Constants.platform?.ios ? 'iOS' : Constants.platform?.android ? 'Android' : 'Web'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Environment Variables (Raw)</Text>
        <Text style={styles.item}>APP_ENV: {expoConfig.APP_ENV || 'undefined'}</Text>
        <Text style={styles.item}>API_BASE_URL: {expoConfig.API_BASE_URL || 'undefined'}</Text>
        <Text style={styles.item}>API_BASE_URL_WEB: {expoConfig.API_BASE_URL_WEB || 'undefined'}</Text>
        <Text style={styles.item}>API_TIMEOUT: {expoConfig.API_TIMEOUT || 'undefined'}</Text>
        <Text style={styles.item}>DEBUG: {expoConfig.DEBUG || 'undefined'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Processed ENV Object</Text>
        <Text style={styles.item}>APP_ENV: {ENV.APP_ENV}</Text>
        <Text style={styles.item}>API_BASE_URL: {ENV.API_BASE_URL}</Text>
        <Text style={styles.item}>API_BASE_URL_WEB: {ENV.API_BASE_URL_WEB}</Text>
        <Text style={styles.item}>API_TIMEOUT: {ENV.API_TIMEOUT}</Text>
        <Text style={styles.item}>API_RETRY_ATTEMPTS: {ENV.API_RETRY_ATTEMPTS}</Text>
        <Text style={styles.item}>DEBUG: {ENV.DEBUG ? 'true' : 'false'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Environment Utils</Text>
        <Text style={styles.item}>isDevelopment: {EnvUtils.isDevelopment() ? 'true' : 'false'}</Text>
        <Text style={styles.item}>isProduction: {EnvUtils.isProduction() ? 'true' : 'false'}</Text>
        <Text style={styles.item}>isDebugEnabled: {EnvUtils.isDebugEnabled() ? 'true' : 'false'}</Text>
        <Text style={styles.item}>getApiBaseUrl: {EnvUtils.getApiBaseUrl()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚩 Feature Flags</Text>
        <Text style={styles.item}>STRIPE_PAYMENTS: {ENV.FEATURE_STRIPE_PAYMENTS ? 'enabled' : 'disabled'}</Text>
        <Text style={styles.item}>GOOGLE_CALENDAR: {ENV.FEATURE_GOOGLE_CALENDAR ? 'enabled' : 'disabled'}</Text>
        <Text style={styles.item}>PUSH_NOTIFICATIONS: {ENV.FEATURE_PUSH_NOTIFICATIONS ? 'enabled' : 'disabled'}</Text>
        <Text style={styles.item}>OFFLINE_MODE: {ENV.FEATURE_OFFLINE_MODE ? 'enabled' : 'disabled'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 All Available Keys</Text>
        <Text style={styles.item}>
          {Object.keys(expoConfig).length > 0 
            ? Object.keys(expoConfig).join(', ')
            : 'No keys found in expoConfig.extra'
          }
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Validation</Text>
        <Text style={[styles.item, ENV.API_BASE_URL.startsWith('https:') ? styles.warning : styles.success]}>
          Protocol: {ENV.API_BASE_URL.startsWith('https:') ? 'HTTPS (⚠️ Check backend)' : 'HTTP (✅ Correct)'}
        </Text>
        <Text style={[styles.item, ENV.API_TIMEOUT > 0 ? styles.success : styles.error]}>
          Timeout: {ENV.API_TIMEOUT > 0 ? '✅ Valid' : '❌ Invalid'}
        </Text>
        <Text style={[styles.item, ENV.API_RETRY_ATTEMPTS >= 0 ? styles.success : styles.error]}>
          Retry Attempts: {ENV.API_RETRY_ATTEMPTS >= 0 ? '✅ Valid' : '❌ Invalid'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
    color: '#666',
  },
  success: {
    color: '#22c55e',
  },
  warning: {
    color: '#f59e0b',
  },
  error: {
    color: '#ef4444',
  },
});

export default EnvironmentDebug;
