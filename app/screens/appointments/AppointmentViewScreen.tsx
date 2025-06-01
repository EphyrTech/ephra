import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService, Appointment } from '../../services/api';
import { isCareProvider } from '../../utils/roleUtils';
import { handleApiError } from '../../utils/errorUtils';

interface AppointmentViewScreenProps {
  route: {
    params: {
      appointmentId: string;
    };
  };
  navigation: any;
}

const AppointmentViewScreen = ({ route, navigation }: AppointmentViewScreenProps) => {
  const { appointmentId } = route.params;
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);



  const loadAppointment = async () => {
    try {
      setLoading(true);
      const appointmentData = await appointmentService.getAppointment(appointmentId);
      setAppointment(appointmentData);

      // Note: Due to privacy restrictions, we can only access basic user information
      // that's already included in the appointment data (user_name, user_email, etc.)
      // Detailed profile information (first_name, last_name, date_of_birth, country)
      // requires additional backend modifications to be accessible to care providers.

    } catch (error) {
      console.error('Error loading appointment:', error);
      Alert.alert('Error', 'Failed to load appointment details');
      handleBackPress();
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = () => {
    if (appointment?.meeting_link) {
      Linking.openURL(appointment.meeting_link);
    } else {
      Alert.alert('No Meeting Link', 'This appointment does not have a meeting link available.');
    }
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: confirmCancelAppointment }
      ]
    );
  };

  const confirmCancelAppointment = async () => {
    if (!appointment?.id) {
      console.error('Cannot cancel appointment: No appointment ID found');
      Alert.alert('Error', 'Cannot cancel appointment: No appointment ID found');
      return;
    }

    console.log('Attempting to cancel appointment:', appointment.id);
    console.log('Current appointment status:', appointment.status);

    try {
      const cancelledAppointment = await appointmentService.cancelAppointment(appointment.id);
      console.log('Appointment cancelled successfully:', cancelledAppointment);

      // Update the local appointment state to reflect the cancellation
      setAppointment(cancelledAppointment);
      Alert.alert('Success', 'Appointment cancelled successfully. This time slot is now available for booking again.', [
        {
          text: 'OK',
          onPress: () => handleBackPress()
        }
      ]);
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        response: error.response
      });

      const errorMessage = handleApiError(error, 'APPOINTMENT');
      Alert.alert('Error', `Failed to cancel appointment: ${errorMessage}`);
    }
  };

  const handleBackPress = () => {
    // Try multiple navigation strategies to ensure we can always go back
    try {
      // First, try to go back in the navigation stack
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // If we can't go back, navigate to the Coach screen
        navigation.navigate('Coach');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: try to reset to the main tab navigator
      navigation.reset({
        index: 0,
        routes: [{ name: 'Coach' }],
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy \'at\' h:mm a');
  };

  const canJoinMeeting = () => {
    if (!appointment?.meeting_link) return false;
    if (appointment.status === 'cancelled') return false;

    // Allow joining 15 minutes before the appointment
    const appointmentTime = new Date(appointment.start_time || '');
    const now = new Date();
    const fifteenMinutesBefore = new Date(appointmentTime.getTime() - 15 * 60 * 1000);

    return now >= fifteenMinutesBefore;
  };

  const canCancelAppointment = () => {
    if (!appointment) {
      console.log('Cannot cancel: No appointment data');
      return false;
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      console.log('Cannot cancel: Appointment status is', appointment.status);
      return false;
    }

    // Allow cancellation up to 1 hour before the appointment
    const appointmentTime = new Date(appointment.start_time || '');
    const now = new Date();
    const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000);

    const canCancel = now < oneHourBefore;
    console.log('Cancel appointment check:', {
      appointmentTime: appointmentTime.toISOString(),
      now: now.toISOString(),
      oneHourBefore: oneHourBefore.toISOString(),
      canCancel,
      status: appointment.status
    });

    return canCancel;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorText}>Appointment not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Appointment Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Section */}
        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(appointment.status)}
              size={32}
              color={getStatusColor(appointment.status)}
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Unknown'}
              </Text>
            </View>
          </View>
        </View>

        {/* Date & Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>{formatDateTime(appointment.start_time)}</Text>
            </View>
            {appointment.end_time && (
              <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>
                  Ends at {format(new Date(appointment.end_time), 'h:mm a')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Participant Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isCareProvider(user) ? 'User Information' : 'Care Provider Information'}
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                {isCareProvider(user)
                  ? (appointment.user_name || `User ${appointment.user_id}`)
                  : (appointment.care_provider_name || `Provider ${appointment.care_provider_id}`)
                }
              </Text>
            </View>

            {(isCareProvider(user) ? appointment.user_email : appointment.care_provider_email) && (
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>
                  {isCareProvider(user) ? appointment.user_email : appointment.care_provider_email}
                </Text>
              </View>
            )}

            {/* Note about limited information */}
            <View style={styles.infoNote}>
              <Ionicons name="information-circle" size={16} color="#666" />
              <Text style={styles.infoNoteText}>
                {isCareProvider(user)
                  ? "Additional user details (date of birth, country, timezone) require enhanced permissions."
                  : "Contact your care provider for additional information if needed."
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Meeting Link Section */}
        {appointment.meeting_link && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meeting Link</Text>
            <View style={styles.meetingCard}>
              <View style={styles.meetingInfo}>
                <Ionicons name="videocam" size={24} color="#4CAF50" />
                <View style={styles.meetingTextContainer}>
                  <Text style={styles.meetingTitle}>Video Conference</Text>
                  <Text style={styles.meetingSubtitle}>
                    {canJoinMeeting() ? 'Ready to join' : 'Available 15 minutes before appointment'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.joinButton,
                  !canJoinMeeting() && styles.joinButtonDisabled
                ]}
                onPress={handleJoinMeeting}
                disabled={!canJoinMeeting()}
              >
                <Ionicons name="videocam" size={20} color="#fff" />
                <Text style={styles.joinButtonText}>Join Meeting</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notes Section */}
        {appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.infoCard}>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {canCancelAppointment() && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelAppointment}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
              <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerBackButton: {
    padding: 5,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
  },
  statusInfo: {
    marginLeft: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6c757d',
  },
  infoNoteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  meetingCard: {
    backgroundColor: '#f0f8f0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  meetingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  meetingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  joinButtonDisabled: {
    backgroundColor: '#ccc',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AppointmentViewScreen;
