import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, isSameDay } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import Calendar from '../../components/calendar/Calendar';
import { useAuth } from '../../hooks/useAuth';
import {
  getUserAppointments,
  Appointment
} from '../../services/firebase/appointmentService';
import {
  getUserJournalEntries,
  JournalEntry
} from '../../services/firebase/journalService';

type CalendarEvent = {
  id: string;
  type: 'appointment' | 'journal';
  title: string;
  time?: string;
  data: Appointment | JournalEntry;
};

const CalendarScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize with empty data
    setLoading(true);

    if (user) {
      fetchUserData();
    } else {
      // If not logged in, just show the calendar without data
      setLoading(false);
      setMarkedDates({});
      setEvents([]);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch appointments with error handling
      let appointments: Appointment[] = [];
      try {
        appointments = await getUserAppointments(user.uid);
      } catch (appointmentError) {
        console.error('Error fetching appointments:', appointmentError);
        // Continue with empty appointments array
      }

      // Fetch journal entries with error handling
      let journalEntries: JournalEntry[] = [];
      try {
        journalEntries = await getUserJournalEntries(user.uid);
      } catch (journalError) {
        console.error('Error fetching journal entries:', journalError);
        // Continue with empty journal entries array
      }

      // Process data for calendar (even if one of the requests failed)
      processCalendarData(appointments, journalEntries);
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      // Set empty data in case of error
      setMarkedDates({});
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const processCalendarData = (appointments: Appointment[], journalEntries: JournalEntry[]) => {
    const newMarkedDates: Record<string, any> = {};

    // Process appointments
    appointments.forEach(appointment => {
      const startDate = appointment.startTime instanceof Date
        ? appointment.startTime
        : new Date((appointment.startTime as any).seconds * 1000);

      const dateString = format(startDate, 'yyyy-MM-dd');

      newMarkedDates[dateString] = {
        ...(newMarkedDates[dateString] || {}),
        marked: true,
        dotColor: '#4CAF50'
      };
    });

    // Process journal entries
    journalEntries.forEach(entry => {
      const entryDate = entry.date instanceof Date
        ? entry.date
        : new Date((entry.date as any).seconds * 1000);

      const dateString = format(entryDate, 'yyyy-MM-dd');

      newMarkedDates[dateString] = {
        ...(newMarkedDates[dateString] || {}),
        marked: true,
        dotColor: newMarkedDates[dateString]?.dotColor ? '#3F51B5' : '#FFF9C4'
      };
    });

    setMarkedDates(newMarkedDates);
    updateEventsForSelectedDate(selectedDate, appointments, journalEntries);
  };

  const updateEventsForSelectedDate = (
    date: Date,
    appointments: Appointment[],
    journalEntries: JournalEntry[]
  ) => {
    const eventsForDay: CalendarEvent[] = [];

    // Add appointments for the selected day
    appointments.forEach(appointment => {
      const startDate = appointment.startTime instanceof Date
        ? appointment.startTime
        : new Date((appointment.startTime as any).seconds * 1000);

      if (isSameDay(startDate, date)) {
        eventsForDay.push({
          id: appointment.id || '',
          type: 'appointment',
          title: appointment.title,
          time: format(startDate, 'h:mm a'),
          data: appointment
        });
      }
    });

    // Add journal entries for the selected day
    journalEntries.forEach(entry => {
      const entryDate = entry.date instanceof Date
        ? entry.date
        : new Date((entry.date as any).seconds * 1000);

      if (isSameDay(entryDate, date)) {
        eventsForDay.push({
          id: entry.id || '',
          type: 'journal',
          title: entry.mood,
          data: entry
        });
      }
    });

    // Sort events by time (appointments first, then journal entries)
    eventsForDay.sort((a, b) => {
      if (a.type === 'appointment' && b.type === 'appointment') {
        const aTime = (a.data as Appointment).startTime;
        const bTime = (b.data as Appointment).startTime;

        const aDate = aTime instanceof Date ? aTime : new Date((aTime as any).seconds * 1000);
        const bDate = bTime instanceof Date ? bTime : new Date((bTime as any).seconds * 1000);

        return aDate.getTime() - bDate.getTime();
      }

      return a.type === 'appointment' ? -1 : 1;
    });

    setEvents(eventsForDay);
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);

    // Navigate to the day journal screen to show all entries for this day
    navigation.navigate('Journal', {
      screen: 'DayJournal',
      params: {
        date: date    // Pass the selected date
      }
    });

    // Update the events list for the selected date (in the background)
    if (user) {
      // Use Promise.allSettled to handle both promises regardless of success/failure
      Promise.allSettled([
        getUserAppointments(user.uid).catch(error => {
          console.error('Error fetching appointments:', error);
          return []; // Return empty array on error
        }),
        getUserJournalEntries(user.uid).catch(error => {
          console.error('Error fetching journal entries:', error);
          return []; // Return empty array on error
        })
      ])
      .then(results => {
        // Extract the values from the settled promises
        const appointments = results[0].status === 'fulfilled' ? results[0].value : [];
        const journalEntries = results[1].status === 'fulfilled' ? results[1].value : [];

        // Update the events list with whatever data we have
        updateEventsForSelectedDate(date, appointments, journalEntries);
      })
      .catch(error => {
        console.error('Error updating events:', error);
      });
    }
  };

  const handleEventPress = (event: CalendarEvent) => {
    if (event.type === 'appointment') {
      // Navigate to appointment details
      // navigation.navigate('AppointmentDetails', { appointment: event.data });
    } else {
      // Navigate to journal entry
      navigation.navigate('Journal', {
        screen: 'JournalEntry',
        params: { entry: event.data }
      });
    }
  };

  const renderEventItem = ({ item }: { item: CalendarEvent }) => (
    <TouchableOpacity
      style={[
        styles.eventItem,
        item.type === 'appointment' ? styles.appointmentItem : styles.journalItem
      ]}
      onPress={() => handleEventPress(item)}
    >
      <View style={styles.eventIconContainer}>
        <Ionicons
          name={item.type === 'appointment' ? 'calendar' : 'journal'}
          size={24}
          color={item.type === 'appointment' ? '#4CAF50' : '#3F51B5'}
        />
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>
          {item.type === 'appointment' ? item.title : `Mood: ${item.title}`}
        </Text>
        {item.time && <Text style={styles.eventTime}>{item.time}</Text>}
        {item.type === 'journal' && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {(item.data as JournalEntry).notes}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchUserData}
        >
          <Ionicons name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        initialDate={selectedDate}
      />

      <View style={styles.eventsContainer}>
        <Text style={styles.dateHeader}>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : (
          <>
            {events.length > 0 ? (
              <FlatList
                data={events}
                renderItem={renderEventItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.eventsList}
              />
            ) : (
              <View style={styles.noEventsContainer}>
                <Ionicons name="calendar-outline" size={48} color="#ccc" />
                <Text style={styles.noEventsText}>No events for this day</Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 5,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  eventsList: {
    paddingBottom: 20,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  journalItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#3F51B5',
  },
  eventIconContainer: {
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  noEventsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  loader: {
    marginTop: 30,
  },
});

export default CalendarScreen;
