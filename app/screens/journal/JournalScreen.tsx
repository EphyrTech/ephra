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
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import {
  JournalEntry,
  journalService
} from '../../services/api';
import JournalEntryCard from '../../components/journal/JournalEntryCard';

interface GroupedEntries {
  date: Date;
  entries: JournalEntry[];
}

const JournalScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [groupedEntries, setGroupedEntries] = useState<GroupedEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchJournalEntries();
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchJournalEntries();
      }
    }, [user])
  );

  useEffect(() => {
    if (entries.length > 0) {
      groupEntriesByDate();
    } else {
      setGroupedEntries([]);
    }
  }, [entries]);

  const fetchJournalEntries = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const journalEntries = await journalService.getJournalEntries();
      const sortedEntries = journalEntries.sort((a, b) => {
        const dateA = new Date(a.date || a.created_at || 0);
        const dateB = new Date(b.date || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupEntriesByDate = () => {
    const groups: Record<string, JournalEntry[]> = {};

    entries.forEach(entry => {
      let entryDate: Date;
      if (entry.date instanceof Date) {
        entryDate = entry.date;
      } else if (typeof entry.date === 'string') {
        entryDate = new Date(entry.date);
      } else if (entry.created_at) {
        entryDate = new Date(entry.created_at);
      } else {
        entryDate = new Date();
      }

      const dateString = entryDate.toDateString();
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(entry);
    });

    const result: GroupedEntries[] = Object.keys(groups).map(dateString => ({
      date: new Date(dateString),
      entries: groups[dateString]
    }));

    result.sort((a, b) => b.date.getTime() - a.date.getTime());
    setGroupedEntries(result);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJournalEntries();
    setRefreshing(false);
  };

  const handleEntryPress = (entry: JournalEntry) => {
    navigation.navigate('JournalEntry', { entryId: entry.id });
  };

  const handleDayPress = (date: Date) => {
    navigation.navigate('DayJournal', { date });
  };

  const handleAddEntry = () => {
    navigation.navigate('JournalEntry', { date: new Date() });
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="journal-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No journal entries yet</Text>
      <Text style={styles.emptySubtext}>
        Start tracking your emotions and experiences
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleAddEntry}
      >
        <Text style={styles.emptyButtonText}>Create First Entry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDateHeader = (date: Date) => {
    const formattedDate = format(date, 'EEEE, MMMM d, yyyy');

    return (
      <TouchableOpacity
        style={styles.dateHeader}
        onPress={() => handleDayPress(date)}
      >
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
      </TouchableOpacity>
    );
  };

  const renderDayEntries = ({ item }: { item: GroupedEntries }) => {
    return (
      <View style={styles.dayContainer}>
        {renderDateHeader(item.date)}
        {item.entries.map((entry) => (
          <JournalEntryCard
            key={entry.id}
            entry={entry}
            onPress={handleEntryPress}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
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
          data={groupedEntries}
          renderItem={renderDayEntries}
          keyExtractor={(item) => item.date.toISOString()}
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
  addButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContainer: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JournalScreen;
