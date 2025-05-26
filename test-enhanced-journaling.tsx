/**
 * Test Component for Enhanced Journaling Features
 *
 * This is a simple test component to verify that the enhanced journaling
 * features are working correctly. You can use this to test the UI components
 * without going through the full app navigation.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import JournalEntryCard from './app/components/journal/JournalEntryCard';
import { JournalEntry } from './app/services/api';

// Sample journal entry data for testing
const sampleEntries: JournalEntry[] = [
  {
    id: '1',
    title: 'Great Day at Work',
    content: 'Had an amazing day at work today. Completed the project ahead of schedule.',
    mood: 'rad',
    emotions: ['happy', 'excited', 'confident'],
    sleep: 'good',
    quickNote: 'Feeling awesome!',
    notes: 'Today was particularly productive. I managed to finish the quarterly report and even had time to help a colleague with their presentation.',
    date: new Date().toISOString(),
    sharedWithCoach: true,
    photoUrls: ['https://via.placeholder.com/150'],
    voiceMemoUrls: ['audio1.m4a'],
    voiceMemoDurations: [45],
    pdfUrls: [],
    pdfNames: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Feeling Overwhelmed',
    content: 'Too many things on my plate today. Need to prioritize better.',
    mood: 'bad',
    emotions: ['stressed', 'overwhelmed', 'anxious'],
    sleep: 'poor',
    quickNote: 'Rough day...',
    notes: 'Work has been piling up and I feel like I cannot catch up. Maybe I should talk to my manager about workload distribution.',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    sharedWithCoach: false,
    photoUrls: [],
    voiceMemoUrls: ['audio2.m4a', 'audio3.m4a'],
    voiceMemoDurations: [30, 60],
    pdfUrls: ['document1.pdf'],
    pdfNames: ['Meeting Notes.pdf'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Peaceful Morning',
    content: 'Started the day with meditation and a nice walk.',
    mood: 'good',
    emotions: ['calm', 'peaceful', 'grateful'],
    sleep: 'excellent',
    quickNote: 'Beautiful sunrise today',
    notes: 'Woke up early and decided to take a walk in the park. The morning air was crisp and refreshing.',
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    sharedWithCoach: true,
    photoUrls: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
    voiceMemoUrls: [],
    voiceMemoDurations: [],
    pdfUrls: [],
    pdfNames: [],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const TestEnhancedJournaling: React.FC = () => {
  const handleEntryPress = (entry: JournalEntry) => {
    console.log('Entry pressed:', entry.title);
    // In a real app, this would navigate to the edit screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enhanced Journaling Test</Text>
        <Text style={styles.subtitle}>Testing journal entry cards with rich content</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Sample Journal Entries</Text>

        {sampleEntries.map((entry) => (
          <JournalEntryCard
            key={entry.id}
            entry={entry}
            onPress={handleEntryPress}
          />
        ))}

        <View style={styles.testInfo}>
          <Text style={styles.testInfoTitle}>Test Features:</Text>
          <Text style={styles.testInfoText}>✓ Mood display with emojis (😄😊😐😞😢)</Text>
          <Text style={styles.testInfoText}>✓ Emotion chips with emojis (😊🤩🙏😌😎⚡☮️🥰🏆🌟😰😤😢😠😔🤯😴😟😞)</Text>
          <Text style={styles.testInfoText}>✓ Sleep quality tracking with emojis (😴😊😐😵🥱)</Text>
          <Text style={styles.testInfoText}>✓ Media indicators (photos, voice, documents)</Text>
          <Text style={styles.testInfoText}>✓ Coach sharing badges</Text>
          <Text style={styles.testInfoText}>✓ Photo previews</Text>
          <Text style={styles.testInfoText}>✓ Rich text content</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  testInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  testInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  testInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default TestEnhancedJournaling;
