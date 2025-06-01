import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService, AssignedUser, AppointmentCreate } from '../../services/api';
import { isCareProvider, validateUserRole, debugUserRole } from '../../utils/roleUtils';
import { handleApiError } from '../../utils/errorUtils';

const CreateAppointmentScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AssignedUser | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Web-specific state for datetime input text
  const [startDateInputText, setStartDateInputText] = useState('');
  const [endDateInputText, setEndDateInputText] = useState('');

  useEffect(() => {
    // Debug user role
    debugUserRole(user, 'CreateAppointmentScreen');

    // Validate user has care provider role
    if (!validateUserRole(user, ['CARE_PROVIDER', 'care'], 'create appointments')) {
      Alert.alert(
        'Access Denied',
        'Only care providers can create appointments for users.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    loadAssignedUsers();
  }, [user]);

  // Initialize web datetime input text when dates change
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const formatForDateTimeLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setStartDateInputText(formatForDateTimeLocal(startDate));
      setEndDateInputText(formatForDateTimeLocal(endDate));
    }
  }, [startDate, endDate]);

  const loadAssignedUsers = async () => {
    try {
      setLoading(true);
      const users = await appointmentService.getAssignedUsers();
      setAssignedUsers(users);
    } catch (error: any) {
      console.error('Error loading assigned users:', error);
      const errorMessage = handleApiError(error, 'USER');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: AssignedUser) => {
    setSelectedUser(selectedUser);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // Automatically set end date to 1 hour later
      setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Web-specific datetime handlers
  const handleWebStartDateTimeChange = (value: string) => {
    setStartDateInputText(value);
    if (value) {
      const newDate = new Date(value);
      if (!isNaN(newDate.getTime())) {
        setStartDate(newDate);
        // Automatically set end date to 1 hour later
        setEndDate(new Date(newDate.getTime() + 60 * 60 * 1000));
      }
    }
  };

  const handleWebEndDateTimeChange = (value: string) => {
    setEndDateInputText(value);
    if (value) {
      const newDate = new Date(value);
      if (!isNaN(newDate.getTime())) {
        setEndDate(newDate);
      }
    }
  };

  const openWebStartDateTimePicker = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'datetime-local';
      input.value = startDateInputText;

      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          handleWebStartDateTimeChange(target.value);
        }
      };

      input.click();
    }
  };

  const openWebEndDateTimePicker = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'datetime-local';
      input.value = endDateInputText;

      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          handleWebEndDateTimeChange(target.value);
        }
      };

      input.click();
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedUser) {
      Alert.alert('Error', 'Please select a user for the appointment');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    try {
      setCreating(true);

      const appointmentData: AppointmentCreate = {
        user_id: selectedUser.id,
        care_provider_id: user?.id || '', // Use care_provider_id instead of specialist_id
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      };

      await appointmentService.createAppointmentForUser(appointmentData);

      Alert.alert(
        'Success',
        'Appointment created successfully!',
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
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading assigned users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Select Patient</Text>

        {assignedUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No assigned users found</Text>
            <Text style={styles.emptySubtext}>
              Contact your administrator to get users assigned to you
            </Text>
          </View>
        ) : (
          assignedUsers.map((assignedUser) => (
            <TouchableOpacity
              key={assignedUser.id}
              style={[
                styles.userCard,
                selectedUser?.id === assignedUser.id && styles.selectedUserCard
              ]}
              onPress={() => handleUserSelect(assignedUser)}
            >
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{assignedUser.name}</Text>
                <Text style={styles.userEmail}>{assignedUser.email}</Text>
              </View>
              {selectedUser?.id === assignedUser.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))
        )}

        {selectedUser && (
          <>
            <Text style={styles.sectionTitle}>Appointment Time</Text>

            {Platform.OS === 'web' ? (
              // Web-specific datetime inputs
              <>
                <View style={styles.webDateTimeContainer}>
                  <Text style={styles.webDateTimeLabel}>Start Time</Text>
                  <View style={styles.webDateTimeInputContainer}>
                    <TextInput
                      style={styles.webDateTimeInput}
                      value={startDateInputText}
                      onChangeText={handleWebStartDateTimeChange}
                      placeholder="Select start date and time"
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.webDateTimePickerButton}
                      onPress={openWebStartDateTimePicker}
                    >
                      <Ionicons name="calendar" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.webDateTimeContainer}>
                  <Text style={styles.webDateTimeLabel}>End Time</Text>
                  <View style={styles.webDateTimeInputContainer}>
                    <TextInput
                      style={styles.webDateTimeInput}
                      value={endDateInputText}
                      onChangeText={handleWebEndDateTimeChange}
                      placeholder="Select end date and time"
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.webDateTimePickerButton}
                      onPress={openWebEndDateTimePicker}
                    >
                      <Ionicons name="calendar" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              // Mobile datetime buttons
              <>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#4CAF50" />
                  <Text style={styles.dateTimeText}>
                    Start: {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#4CAF50" />
                  <Text style={styles.dateTimeText}>
                    End: {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.createButton, creating && styles.disabledButton]}
              onPress={handleCreateAppointment}
              disabled={creating}
            >
              <Text style={styles.createButtonText}>
                {creating ? 'Creating...' : 'Create Appointment'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {showStartPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={startDate}
          mode="datetime"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {showEndPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={endDate}
          mode="datetime"
          display="default"
          onChange={handleEndDateChange}
        />
      )}
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
  backButton: {
    padding: 5,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedUserCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dateTimeText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  // Web-specific datetime styles
  webDateTimeContainer: {
    marginBottom: 16,
  },
  webDateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  webDateTimeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  webDateTimeInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'transparent',
    borderRadius: 12,
    ...(Platform.OS === 'web' && {
      // @ts-ignore - Web-specific styles
      outline: 'none',
    }),
  },
  webDateTimePickerButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      // @ts-ignore - Web-specific styles
      cursor: 'pointer',
    }),
  },
});

export default CreateAppointmentScreen;
