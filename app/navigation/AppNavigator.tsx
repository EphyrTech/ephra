import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

// Import actual screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import JournalScreen from '../screens/journal/JournalScreen';
import JournalEntryScreen from '../screens/journal/JournalEntryScreen';
import DayJournalScreen from '../screens/journal/DayJournalScreen';
import FullNoteScreen from '../screens/journal/FullNoteScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';

// Import appointment screens
import SpecialistTypeScreen from '../screens/appointments/SpecialistTypeScreen';
import SpecialistListScreen from '../screens/appointments/SpecialistListScreen';
import SpecialistAvailabilityScreen from '../screens/appointments/SpecialistAvailabilityScreen';
import AppointmentDetailsScreen from '../screens/appointments/AppointmentDetailsScreen';
import PaymentLinkScreen from '../screens/appointments/PaymentLinkScreen';
import AppointmentConfirmationScreen from '../screens/appointments/AppointmentConfirmationScreen';
import CoachScreen from '../screens/coach/CoachScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChangeEmailScreen from '../screens/profile/ChangeEmailScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import DeleteAccountScreen from '../screens/profile/DeleteAccountScreen';

// Placeholder components for screens not yet created
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title} Screen</Text>
  </View>
);

// Main App Screens (some are still placeholders)
// CalendarScreen, JournalScreen, JournalEntryScreen and CoachScreen are imported above
const ScheduleSessionScreen = () => <PlaceholderScreen title="Schedule Session" />;
const SettingsScreen = () => <PlaceholderScreen title="Settings" />;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Journal Navigator
const JournalNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="JournalList" component={JournalScreen} options={{ title: 'Journal' }} />
    <Stack.Screen
      name="DayJournal"
      component={DayJournalScreen}
      options={{
        title: 'Day Journal',
        headerShown: false
      }}
    />
    <Stack.Screen
      name="JournalEntry"
      component={JournalEntryScreen}
      options={({ route }) => ({
        title: route.params?.entry ? 'Edit Entry' : 'New Entry',
        headerShown: false
      })}
    />
    <Stack.Screen
      name="FullNote"
      component={FullNoteScreen}
      options={{
        title: 'Full Note',
        headerShown: false
      }}
    />
  </Stack.Navigator>
);

// Coach Navigator
const CoachNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="CoachHome" component={CoachScreen} options={{ title: 'Coach' }} />
    <Stack.Screen name="SpecialistType" component={SpecialistTypeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SpecialistList" component={SpecialistListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SpecialistAvailability" component={SpecialistAvailabilityScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PaymentLink" component={PaymentLinkScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AppointmentConfirmation" component={AppointmentConfirmationScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// Main Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Calendar') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Journal') {
          iconName = focused ? 'journal' : 'journal-outline';
        } else if (route.name === 'Coach') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="Journal" component={JournalNavigator} options={{ headerShown: false }} />
    <Tab.Screen name="Coach" component={CoachNavigator} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Return a loading screen
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
