import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface JournalEntryCardProps {
  entry: any;
  onPress: (entry: any) => void;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(entry)}>
      <View>
        <Text style={styles.title}>Journal Entry</Text>
        <Text style={styles.content}>
          {entry.notes || entry.content || entry.quickNote || 'No content'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: '#666',
  },
});

export default JournalEntryCard;
