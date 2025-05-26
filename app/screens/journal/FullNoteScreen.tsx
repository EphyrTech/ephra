import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const FullNoteScreen = ({ route, navigation }: any) => {
  const { entry } = route.params || {};

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Note</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No entry found</Text>
        </View>
      </SafeAreaView>
    );
  }

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

  const formattedDate = format(entryDate, 'EEEE, MMMM d, yyyy');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Full Note</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('JournalEntry', { entryId: entry.id })}
        >
          <Ionicons name="create-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          {entry.mood && (
            <View style={styles.moodContainer}>
              <Text style={styles.moodText}>{entry.mood}</Text>
            </View>
          )}
        </View>

        <View style={styles.notesContainer}>
          <Text style={styles.notes}>
            {entry.notes || entry.content || entry.quickNote || 'No notes available'}
          </Text>
        </View>

        {entry.sharedWithCoach && (
          <View style={styles.sharedBadge}>
            <Ionicons name="eye-outline" size={16} color="white" />
            <Text style={styles.sharedText}>Shared with coach</Text>
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
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  date: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  moodContainer: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  moodText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  notesContainer: {
    flex: 1,
  },
  notes: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#3F51B5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 24,
  },
  sharedText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default FullNoteScreen;
