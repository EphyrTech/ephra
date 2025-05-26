import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, isSameDay } from 'date-fns';
import {
  Specialist,
  specialistService
} from '../../services/api';

export interface TimeSlot {
  startTime: Date | { seconds: number };
  endTime: Date | { seconds: number };
  isBooked: boolean;
}

const SpecialistAvailabilityScreen = ({ route, navigation }: any) => {
  const { specialist } = route.params;
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    fetchAvailableDates();
  }, [specialist]);

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedDate]);

  const fetchAvailableDates = async () => {
    setLoading(true);
    try {
      console.log('Fetching availability for specialist:', specialist.id);

      // Fetch availability from API
      const availability = await specialistService.getSpecialistAvailability(specialist.id);
      console.log('Fetched availability:', availability);

      // Extract unique dates from availability
      const availabilityDates = new Set<string>();

      availability.forEach(slot => {
        const slotDate = new Date(slot.start_time);

        if (slot.is_available) {
          // Format as YYYY-MM-DD to ensure uniqueness
          const dateString = slotDate.toISOString().split('T')[0];
          availabilityDates.add(dateString);
        }
      });

      // Convert back to Date objects
      const dates = Array.from(availabilityDates).map(dateString => {
        return new Date(dateString + 'T00:00:00');
      });

      // Sort dates
      dates.sort((a, b) => a.getTime() - b.getTime());

      setAvailableDates(dates);

      // Select the first available date by default
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      // Fallback to mock data or empty state
      setAvailableDates([]);
      Alert.alert('Notice', 'No availability data found. This may be demo data.');
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    if (!selectedDate || !specialist.id) return;

    setLoading(true);
    try {
      // Fetch availability from API
      const availability = await specialistService.getSpecialistAvailability(specialist.id);

      // Filter time slots for the selected date that are available
      const selectedDateString = selectedDate.toISOString().split('T')[0];

      const availableSlots = availability.filter(slot => {
        const slotDate = new Date(slot.start_time);
        const slotDateString = slotDate.toISOString().split('T')[0];

        return slotDateString === selectedDateString && slot.is_available;
      });

      // Convert to the expected TimeSlot format
      const convertedSlots: TimeSlot[] = availableSlots.map(slot => ({
        startTime: new Date(slot.start_time),
        endTime: new Date(slot.end_time),
        isBooked: !slot.is_available
      }));

      // Sort by start time
      convertedSlots.sort((a, b) => {
        const timeA = (a.startTime as Date).getTime();
        const timeB = (b.startTime as Date).getTime();
        return timeA - timeB;
      });

      setTimeSlots(convertedSlots);
      setSelectedTimeSlot(null); // Reset selected time slot when date changes
      setLoading(false);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // Fallback to empty slots
      setTimeSlots([]);
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleContinue = () => {
    if (!selectedTimeSlot) {
      Alert.alert('Selection Required', 'Please select a time slot to continue.');
      return;
    }

    navigation.navigate('AppointmentDetails', {
      specialist,
      timeSlot: selectedTimeSlot
    });
  };

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = selectedDate && isSameDay(selectedDate, item);
    const dayName = format(item, 'EEE');
    const dayNumber = format(item, 'd');
    const month = format(item, 'MMM');

    return (
      <TouchableOpacity
        style={[styles.dateItem, isSelected && styles.selectedDateItem]}
        onPress={() => handleDateSelect(item)}
      >
        <Text style={[styles.dayName, isSelected && styles.selectedDateText]}>
          {dayName}
        </Text>
        <Text style={[styles.dayNumber, isSelected && styles.selectedDateText]}>
          {dayNumber}
        </Text>
        <Text style={[styles.month, isSelected && styles.selectedDateText]}>
          {month}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTimeSlot = (timeSlot: TimeSlot) => {
    const startTime = timeSlot.startTime instanceof Date
      ? timeSlot.startTime
      : new Date((timeSlot.startTime as any).seconds * 1000);

    const endTime = timeSlot.endTime instanceof Date
      ? timeSlot.endTime
      : new Date((timeSlot.endTime as any).seconds * 1000);

    const formattedStartTime = format(startTime, 'h:mm a');
    const formattedEndTime = format(endTime, 'h:mm a');
    const isSelected = selectedTimeSlot &&
      selectedTimeSlot.startTime === timeSlot.startTime &&
      selectedTimeSlot.endTime === timeSlot.endTime;

    return (
      <TouchableOpacity
        key={formattedStartTime}
        style={[styles.timeSlot, isSelected && styles.selectedTimeSlot]}
        onPress={() => handleTimeSlotSelect(timeSlot)}
      >
        <Text style={[styles.timeText, isSelected && styles.selectedTimeText]}>
          {formattedStartTime} - {formattedEndTime}
        </Text>
      </TouchableOpacity>
    );
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
        <Text style={styles.title}>Select Date & Time</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.specialistInfo}>
        <Text style={styles.specialistName}>{specialist.name}</Text>
        <Text style={styles.specialistTitle}>{specialist.title}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Available Dates</Text>

        {loading && !selectedDate ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : (
          <FlatList
            horizontal
            data={availableDates}
            renderItem={renderDateItem}
            keyExtractor={(item) => item.toISOString()}
            contentContainerStyle={styles.dateList}
            showsHorizontalScrollIndicator={false}
          />
        )}

        <Text style={styles.sectionTitle}>Available Times</Text>

        {loading && selectedDate ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : (
          <ScrollView style={styles.timeSlotsContainer}>
            {timeSlots.length > 0 ? (
              <View style={styles.timeSlotGrid}>
                {timeSlots.map(renderTimeSlot)}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No available time slots</Text>
                <Text style={styles.emptySubtext}>
                  Please select a different date
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedTimeSlot && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedTimeSlot}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  specialistInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  specialistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialistTitle: {
    fontSize: 14,
    color: '#4CAF50',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateList: {
    paddingVertical: 8,
  },
  dateItem: {
    width: 70,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  selectedDateItem: {
    backgroundColor: '#4CAF50',
  },
  dayName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  month: {
    fontSize: 14,
    color: '#666',
  },
  selectedDateText: {
    color: '#fff',
  },
  timeSlotsContainer: {
    flex: 1,
    marginTop: 8,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#4CAF50',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: '500',
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
});

export default SpecialistAvailabilityScreen;
