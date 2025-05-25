import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { JournalEntry } from '../../services/api';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: (entry: JournalEntry) => void;
}

const getMoodIcon = (mood: string) => {
  switch (mood.toLowerCase()) {
    case 'happy':
      return 'happy-outline';
    case 'sad':
      return 'sad-outline';
    case 'angry':
      return 'flame-outline';
    case 'anxious':
      return 'alert-circle-outline';
    case 'calm':
      return 'water-outline';
    default:
      return 'help-circle-outline';
  }
};

const getMoodColor = (mood: string) => {
  switch (mood.toLowerCase()) {
    case 'happy':
      return '#4CAF50'; // Green
    case 'sad':
      return '#3F51B5'; // Blue
    case 'angry':
      return '#F44336'; // Red
    case 'anxious':
      return '#FF9800'; // Orange
    case 'calm':
      return '#00BCD4'; // Cyan
    default:
      return '#9E9E9E'; // Grey
  }
};

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onPress }) => {
  // Handle different date formats from API
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

  const formattedDate = format(entryDate, 'MMMM d, yyyy');
  const moodIcon = getMoodIcon(entry.mood || 'neutral');
  const moodColor = getMoodColor(entry.mood || 'neutral');

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(entry)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{formattedDate}</Text>
        <View style={[styles.moodContainer, { backgroundColor: moodColor }]}>
          <Ionicons name={moodIcon} size={16} color="white" />
          <Text style={styles.moodText}>{entry.mood}</Text>
        </View>
      </View>

      <Text style={styles.notes} numberOfLines={3}>
        {entry.notes || entry.content || entry.quickNote || 'No notes'}
      </Text>

      {entry.photoUrls && entry.photoUrls.length > 0 && (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: entry.photoUrls[0] }}
            style={styles.photo}
            resizeMode="cover"
          />
          {entry.photoUrls.length > 1 && (
            <View style={styles.photoCountBadge}>
              <Text style={styles.photoCountText}>+{entry.photoUrls.length - 1}</Text>
            </View>
          )}
        </View>
      )}

      {entry.sharedWithCoach && (
        <View style={styles.sharedBadge}>
          <Ionicons name="eye-outline" size={12} color="white" />
          <Text style={styles.sharedText}>Shared with coach</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  moodText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  notes: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  photoContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#3F51B5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sharedText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
  },
});

export default JournalEntryCard;
