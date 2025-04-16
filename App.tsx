import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './app/navigation/AppNavigator';
import { AuthProvider } from './app/contexts/AuthContext';
import StripeProvider from './app/components/StripeProvider';
// These will be created later if needed
// import { ThemeProvider } from './app/contexts/ThemeContext';
// import { NotificationProvider } from './app/contexts/NotificationContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StripeProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </StripeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
