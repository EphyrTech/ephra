import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, addMinutes } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService } from '../../services/api';
import { addAppointmentToCalendar } from '../../services/googleCalendarService';
import { handleApiError } from '../../utils/errorUtils';

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' }
];

interface AppointmentDetailsScreenProps {
  route: {
    params: {
      specialist: {
        id: string;
        name: string;
        type: 'mental' | 'physical';
        title: string;
      };
      timeSlot: {
        startTime: Date | { seconds: number };
        endTime: Date | { seconds: number };
      };
    };
  };
  navigation: any;
}

const AppointmentDetailsScreen = ({ route, navigation }: AppointmentDetailsScreenProps) => {
  const { specialist, timeSlot } = route.params;
  const { user } = useAuth();
  const [title, setTitle] = useState('Appointment with ' + specialist.name);
  const [description, setDescription] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(30); // Default to 30 minutes
  const [loading, setLoading] = useState(false);
  const [meetLink, setMeetLink] = useState<string | null>(null);

  const startTime = timeSlot.startTime instanceof Date
    ? timeSlot.startTime
    : new Date((timeSlot.startTime as { seconds: number }).seconds * 1000);

  const calculateEndTime = () => {
    return addMinutes(startTime, selectedDuration);
  };

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
  };

  const handleCreateAppointment = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to book an appointment.');
      return;
    }

    setLoading(true);
    try {
      // Calculate the end time based on selected duration
      const endTime = calculateEndTime();

      // Create appointment via API
      const appointmentData = {
        care_provider_id: specialist.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: description,
      };

      const createdAppointment = await appointmentService.createAppointment(appointmentData);
      console.log('Appointment created:', createdAppointment);

      // Create a calendar event with Google Meet link (optional)
      try {
        const { meetLink: newMeetLink } = await addAppointmentToCalendar(
          specialist,
          startTime,
          endTime,
          title,
          description
        );
        setMeetLink(newMeetLink);
      } catch (calendarError) {
        console.warn('Calendar integration failed:', calendarError);
        // Continue without calendar integration
      }

      // Show success message
      Alert.alert(
        'Appointment Scheduled',
        'Your appointment has been scheduled successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      const errorMessage = handleApiError(error, 'APPOINTMENT');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Appointment Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialist</Text>
          <View style={styles.specialistCard}>
            <View style={styles.specialistInfo}>
              <Text style={styles.specialistName}>{specialist.name}</Text>
              <Text style={styles.specialistTitle}>{specialist.title}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                {format(startTime, 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                {format(startTime, 'h:mm a')} - {format(calculateEndTime(), 'h:mm a')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Duration</Text>
          <View style={styles.durationOptions}>
            {DURATION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.durationOption,
                  selectedDuration === option.value && styles.selectedDurationOption
                ]}
                onPress={() => handleDurationSelect(option.value)}
              >
                <Text
                  style={[
                    styles.durationText,
                    selectedDuration === option.value && styles.selectedDurationText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter appointment title"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Add any notes or questions for your specialist"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {meetLink && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Google Meet Link</Text>
            <View style={styles.meetLinkContainer}>
              <Text style={styles.meetLink} numberOfLines={1} ellipsizeMode="middle">
                {meetLink}
              </Text>
              <TouchableOpacity
                style={styles.openLinkButton}
                onPress={() => Linking.openURL(meetLink)}
              >
                <Ionicons name="open-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.meetLinkInfo}>
              This link will be used for your virtual appointment. You can also find it in your Google Calendar.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleCreateAppointment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Create Appointment</Text>
              <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  specialistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  specialistInfo: {
    flex: 1,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialistTitle: {
    fontSize: 14,
    color: '#4CAF50',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  durationOption: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  selectedDurationOption: {
    backgroundColor: '#4CAF50',
  },
  durationText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDurationText: {
    color: '#fff',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  // Google Meet link styles
  meetLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  meetLink: {
    flex: 1,
    fontSize: 14,
    color: '#3F51B5',
    marginRight: 8,
  },
  openLinkButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
  },
  meetLinkInfo: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AppointmentDetailsScreen;
