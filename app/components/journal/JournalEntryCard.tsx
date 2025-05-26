import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { JournalEntry } from '../../services/api';

// Mood emoji mapping
const MOOD_EMOJIS: Record<string, string> = {
  'rad': '😄',
  'good': '😊',
  'meh': '😐',
  'bad': '😞',
  'awful': '😢',
};

// Emotion emoji mapping
const EMOTION_EMOJIS: Record<string, string> = {
  'happy': '😊',
  'excited': '🤩',
  'grateful': '🙏',
  'calm': '😌',
  'confident': '😎',
  'energetic': '⚡',
  'peaceful': '☮️',
  'loved': '🥰',
  'proud': '🏆',
  'hopeful': '🌟',
  'anxious': '😰',
  'stressed': '😤',
  'sad': '😢',
  'angry': '😠',
  'frustrated': '😤',
  'lonely': '😔',
  'overwhelmed': '🤯',
  'tired': '😴',
  'worried': '😟',
  'disappointed': '😞',
};

// Sleep emoji mapping
const SLEEP_EMOJIS: Record<string, string> = {
  'excellent': '😴',
  'good': '😊',
  'okay': '😐',
  'poor': '😵',
  'terrible': '🥱',
};

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: (entry: JournalEntry) => void;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onPress }) => {
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

  const formattedDate = format(entryDate, 'h:mm a');
  const formattedTime = format(entryDate, 'MMMM d, yyyy');

  const moodEmoji = entry.mood ? MOOD_EMOJIS[entry.mood.toLowerCase()] : null;
  const hasMedia = (entry.photoUrls && entry.photoUrls.length > 0) ||
                   (entry.voiceMemoUrls && entry.voiceMemoUrls.length > 0) ||
                   (entry.pdfUrls && entry.pdfUrls.length > 0);

  const displayText = entry.quickNote || entry.notes || entry.content || 'No notes';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(entry)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.time}>{formattedDate}</Text>
          <Text style={styles.date}>{formattedTime}</Text>
        </View>
        {entry.mood && (
          <View style={styles.moodContainer}>
            {moodEmoji && <Text style={styles.moodEmoji}>{moodEmoji}</Text>}
            <Text style={styles.moodText}>{entry.mood}</Text>
          </View>
        )}
      </View>

      <Text style={styles.notes} numberOfLines={3}>
        {displayText}
      </Text>

      {/* Emotions */}
      {entry.emotions && entry.emotions.length > 0 && (
        <View style={styles.emotionsContainer}>
          {entry.emotions.slice(0, 3).map((emotion, index) => (
            <View key={index} style={styles.emotionChip}>
              <Text style={styles.emotionEmoji}>{EMOTION_EMOJIS[emotion] || '😊'}</Text>
              <Text style={styles.emotionText}>{emotion}</Text>
            </View>
          ))}
          {entry.emotions.length > 3 && (
            <Text style={styles.moreEmotions}>+{entry.emotions.length - 3} more</Text>
          )}
        </View>
      )}

      {/* Sleep Quality */}
      {entry.sleep && (
        <View style={styles.sleepContainer}>
          <Text style={styles.sleepEmoji}>{SLEEP_EMOJIS[entry.sleep] || '😴'}</Text>
          <Text style={styles.sleepText}>Sleep: {entry.sleep}</Text>
        </View>
      )}

      {/* Media indicators */}
      {hasMedia && (
        <View style={styles.mediaIndicators}>
          {entry.photoUrls && entry.photoUrls.length > 0 && (
            <View style={styles.mediaIndicator}>
              <Ionicons name="image" size={14} color="#666" />
              <Text style={styles.mediaCount}>{entry.photoUrls.length}</Text>
            </View>
          )}
          {entry.voiceMemoUrls && entry.voiceMemoUrls.length > 0 && (
            <View style={styles.mediaIndicator}>
              <Ionicons name="mic" size={14} color="#666" />
              <Text style={styles.mediaCount}>{entry.voiceMemoUrls.length}</Text>
            </View>
          )}
          {entry.pdfUrls && entry.pdfUrls.length > 0 && (
            <View style={styles.mediaIndicator}>
              <Ionicons name="document-text" size={14} color="#666" />
              <Text style={styles.mediaCount}>{entry.pdfUrls.length}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        {entry.sharedWithCoach && (
          <View style={styles.sharedBadge}>
            <Ionicons name="eye-outline" size={12} color="white" />
            <Text style={styles.sharedText}>Shared with coach</Text>
          </View>
        )}

        {/* Preview of first photo if available */}
        {entry.photoUrls && entry.photoUrls.length > 0 && (
          <Image
            source={{ uri: entry.photoUrls[0] }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  notes: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  emotionEmoji: {
    fontSize: 12,
  },
  emotionText: {
    fontSize: 11,
    color: '#666',
    textTransform: 'capitalize',
  },
  sleepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  sleepEmoji: {
    fontSize: 14,
  },
  sleepText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  moreEmotions: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  mediaIndicators: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  mediaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mediaCount: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
});

export default JournalEntryCard;
