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
  getUserJournalEntries,
  JournalEntry
} from '../../services/firebase/journalService';
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
      // Get all journal entries for the user
      const allEntries = await getUserJournalEntries(user.uid);

      // Filter entries for the selected date
      const entriesForDate = allEntries.filter(entry => {
        if (!entry.date) return false;

        const entryDate = entry.date instanceof Date
          ? entry.date
          : new Date((entry.date as any).seconds * 1000);

        return isSameDay(entryDate, new Date(selectedDate));
      });

      // Sort entries by createdAt timestamp (newest first)
      // Create a new sorted array instead of modifying the original
      const sortedEntries = [...entriesForDate].sort((a, b) => {
        const timeA = a.createdAt instanceof Date
          ? a.createdAt.getTime()
          : (a.createdAt as any)?.seconds * 1000 || 0;

        const timeB = b.createdAt instanceof Date
          ? b.createdAt.getTime()
          : (b.createdAt as any)?.seconds * 1000 || 0;

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
    navigation.navigate('JournalEntry', { entry });
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
