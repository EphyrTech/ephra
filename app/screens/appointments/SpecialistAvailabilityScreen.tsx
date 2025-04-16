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
  TimeSlot
} from '../../services/firebase/specialistService';

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
      // Extract unique dates from specialist's availability
      const availabilityDates = new Set<string>();

      specialist.availability?.forEach(slot => {
        const slotDate = slot.startTime instanceof Date
          ? slot.startTime
          : new Date((slot.startTime as any).seconds * 1000);

        if (!slot.isBooked) {
          // Format as YYYY-MM-DD to ensure uniqueness
          const dateString = `${slotDate.getFullYear()}-${slotDate.getMonth() + 1}-${slotDate.getDate()}`;
          availabilityDates.add(dateString);
        }
      });

      // Convert back to Date objects
      const dates = Array.from(availabilityDates).map(dateString => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      });

      // Sort dates
      dates.sort((a, b) => a.getTime() - b.getTime());

      setAvailableDates(dates);

      // Select the first available date by default
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }

      // Simulate network delay
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error processing available dates:', error);
      Alert.alert('Error', 'Failed to load available dates. Please try again.');
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    if (!selectedDate || !specialist.id) return;

    setLoading(true);
    try {
      // Filter time slots for the selected date that are not booked
      const availableSlots = specialist.availability?.filter(slot => {
        const slotDate = slot.startTime instanceof Date
          ? slot.startTime
          : new Date((slot.startTime as any).seconds * 1000);

        return (
          slotDate.getDate() === selectedDate.getDate() &&
          slotDate.getMonth() === selectedDate.getMonth() &&
          slotDate.getFullYear() === selectedDate.getFullYear() &&
          !slot.isBooked
        );
      }) || [];

      // Sort by start time
      availableSlots.sort((a, b) => {
        const timeA = a.startTime instanceof Date
          ? a.startTime.getTime()
          : (a.startTime as any).seconds * 1000;

        const timeB = b.startTime instanceof Date
          ? b.startTime.getTime()
          : (b.startTime as any).seconds * 1000;

        return timeA - timeB;
      });

      setTimeSlots(availableSlots);
      setSelectedTimeSlot(null); // Reset selected time slot when date changes

      // Simulate network delay
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error processing time slots:', error);
      Alert.alert('Error', 'Failed to load time slots. Please try again.');
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
