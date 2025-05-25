import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, isSameDay } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import {
  JournalEntry,
  journalService
} from '../../services/api';
import JournalEntryCard from '../../components/journal/JournalEntryCard';

const DayJournalScreen = ({ route, navigation }: any) => {
  const { date: selectedDate } = route.params || {};
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Format the date for display
  const formattedDate = selectedDate ? format(new Date(selectedDate), 'EEEE, MMMM d, yyyy') : 'Today';

  useEffect(() => {
    if (user && selectedDate) {
      fetchEntriesForDate();
    }
  }, [user, selectedDate]);

  const fetchEntriesForDate = async () => {
    if (!user || !selectedDate) return;

    setLoading(true);
    try {
      console.log('DayJournal: Fetching entries for date:', selectedDate);
      console.log('DayJournal: User ID:', user?.id);
      // Get all journal entries for the user
      const allEntries = await journalService.getJournalEntries();
      console.log('DayJournal: Total entries fetched:', allEntries.length);
      console.log('DayJournal: All entries:', allEntries);

      // Filter entries for the selected date
      const selectedDateObj = new Date(selectedDate);
      console.log('DayJournal: Selected date object:', selectedDateObj);
      console.log('DayJournal: Selected date string:', selectedDateObj.toDateString());

      const entriesForDate = allEntries.filter(entry => {
        console.log('DayJournal: Checking entry:', entry.id, 'Date field:', entry.date, 'Created at:', entry.created_at);

        if (!entry.date && !entry.created_at) {
          console.log('DayJournal: Entry has no date field, skipping');
          return false;
        }

        let entryDate: Date;

        if (entry.date instanceof Date) {
          entryDate = entry.date;
        } else if (typeof entry.date === 'string') {
          entryDate = new Date(entry.date);
        } else if (entry.created_at) {
          entryDate = new Date(entry.created_at);
        } else {
          console.log('DayJournal: Could not parse date for entry:', entry.id);
          return false;
        }

        console.log('DayJournal: Entry date object:', entryDate);
        console.log('DayJournal: Entry date string:', entryDate.toDateString());

        const isSame = isSameDay(entryDate, selectedDateObj);
        console.log('DayJournal: Date comparison result:', isSame);

        if (isSame) {
          console.log('DayJournal: ✅ Found matching entry:', entry.id, entryDate);
        }
        return isSame;
      });

      console.log('DayJournal: Entries for selected date:', entriesForDate.length);

      // Sort entries by created_at timestamp (newest first)
      const sortedEntries = [...entriesForDate].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA; // Descending order (newest first)
      });

      setEntries(sortedEntries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      Alert.alert('Error', 'Failed to load journal entries for this day');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEntriesForDate();
    setRefreshing(false);
  };

  const handleEntryPress = (entry: JournalEntry) => {
    console.log('DayJournal: Opening entry for editing:', entry.id);
    console.log('DayJournal: Entry data:', entry);
    // Pass entryId to trigger API fetch for latest data
    navigation.navigate('JournalEntry', { entryId: entry.id });
  };

  const handleAddEntry = () => {
    navigation.navigate('JournalEntry', { date: selectedDate });
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="journal-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No entries for this day</Text>
      <Text style={styles.emptySubtext}>
        Create your first entry to start tracking your day
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleAddEntry}
      >
        <Text style={styles.emptyButtonText}>Create Entry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{formattedDate}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddEntry}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={entries}
          renderItem={({ item }) => (
            <JournalEntryCard entry={item} onPress={handleEntryPress} />
          )}
          keyExtractor={item => item.id || ''}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          onRefresh={handleRefresh}
          refreshing={refreshing}
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
    justifyContent: 'space-between',
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
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 20,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DayJournalScreen;
