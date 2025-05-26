import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { journalService, JournalEntry, mediaService } from '../../services/api';
import transcriptionService from '../../services/transcription';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

// Mood and emotion options
const MOOD_OPTIONS = [
  { value: 'rad', label: 'Rad', emoji: '😄', color: '#4CAF50' },
  { value: 'good', label: 'Good', emoji: '😊', color: '#8BC34A' },
  { value: 'meh', label: 'Meh', emoji: '😐', color: '#FFC107' },
  { value: 'bad', label: 'Bad', emoji: '😞', color: '#FF9800' },
  { value: 'awful', label: 'Awful', emoji: '😢', color: '#F44336' },
];

const EMOTION_OPTIONS = [
  { value: 'happy', emoji: '😊' },
  { value: 'excited', emoji: '🤩' },
  { value: 'grateful', emoji: '🙏' },
  { value: 'calm', emoji: '😌' },
  { value: 'confident', emoji: '😎' },
  { value: 'energetic', emoji: '⚡' },
  { value: 'peaceful', emoji: '☮️' },
  { value: 'loved', emoji: '🥰' },
  { value: 'proud', emoji: '🏆' },
  { value: 'hopeful', emoji: '🌟' },
  { value: 'anxious', emoji: '😰' },
  { value: 'stressed', emoji: '😤' },
  { value: 'sad', emoji: '😢' },
  { value: 'angry', emoji: '😠' },
  { value: 'frustrated', emoji: '😤' },
  { value: 'lonely', emoji: '😔' },
  { value: 'overwhelmed', emoji: '🤯' },
  { value: 'tired', emoji: '😴' },
  { value: 'worried', emoji: '😟' },
  { value: 'disappointed', emoji: '😞' },
];

const SLEEP_OPTIONS = [
  { value: 'excellent', label: 'Excellent', emoji: '😴', color: '#4CAF50' },
  { value: 'good', label: 'Good', emoji: '😊', color: '#8BC34A' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: '#FFC107' },
  { value: 'poor', label: 'Poor', emoji: '😵', color: '#FF9800' },
  { value: 'terrible', label: 'Terrible', emoji: '🥱', color: '#F44336' },
];

const JournalEntryScreen = ({ route, navigation }: any) => {
  const { entryId, date } = route.params || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Media state
  const [photos, setPhotos] = useState<{uri: string; localUri: string}[]>([]);
  const [voiceMemos, setVoiceMemos] = useState<{uri: string; duration: number; transcription?: string}[]>([]);
  const [pdfFiles, setPdfFiles] = useState<{uri: string; name: string}[]>([]);
  const [transcribing, setTranscribing] = useState<{[key: number]: boolean}>({});

  // UI state
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [quickNote, setQuickNote] = useState('');

  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    title: '',
    notes: '',
    mood: 'good',
    emotions: [],
    date: date ? new Date(date) : new Date(),
    sharedWithCoach: false,
    photoUrls: [],
    voiceMemoUrls: [],
    voiceMemoDurations: [],
    pdfUrls: [],
    pdfNames: [],
  });

  useEffect(() => {
    if (entryId) {
      fetchEntry();
    }
  }, [entryId]);

  const fetchEntry = async () => {
    if (!entryId) return;

    setLoading(true);
    try {
      const foundEntry = await journalService.getJournalEntry(entryId);
      if (foundEntry) {
        setEntry(foundEntry);
        setSelectedEmotions(foundEntry.emotions || []);
        setQuickNote(foundEntry.quickNote || '');

        // Set media arrays from entry data
        if (foundEntry.photoUrls) {
          setPhotos(foundEntry.photoUrls.map(url => ({ uri: url, localUri: url })));
        }
        if (foundEntry.voiceMemoUrls && foundEntry.voiceMemoDurations) {
          setVoiceMemos(foundEntry.voiceMemoUrls.map((url, index) => ({
            uri: url,
            duration: foundEntry.voiceMemoDurations?.[index] || 0
          })));
        }
        if (foundEntry.pdfUrls && foundEntry.pdfNames) {
          setPdfFiles(foundEntry.pdfUrls.map((url, index) => ({
            uri: url,
            name: foundEntry.pdfNames?.[index] || 'Document'
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      Alert.alert('Error', 'Failed to load journal entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!entry.notes?.trim() && !quickNote.trim() && photos.length === 0 && voiceMemos.length === 0) {
      Alert.alert('Error', 'Please add some content before saving');
      return;
    }

    setSaving(true);
    try {
      const entryDate = entry.date || new Date();

      // Prepare entry data
      const entryData: Partial<JournalEntry> = {
        user_id: user.id,
        title: entry.title || `Journal Entry - ${format(entryDate, 'MMM d, yyyy')}`,
        mood: entry.mood || 'good',
        emotions: selectedEmotions,
        notes: entry.notes?.trim() || '',
        content: entry.notes?.trim() || quickNote.trim() || '',
        quickNote: quickNote.trim(),
        date: entryDate,
        sharedWithCoach: entry.sharedWithCoach || false,
      };

      let savedEntry: JournalEntry;

      if (entryId) {
        savedEntry = await journalService.updateJournalEntry(entryId, entryData);
      } else {
        savedEntry = await journalService.createJournalEntry(entryData);
      }

      const finalEntryId = savedEntry.id || entryId;
      if (!finalEntryId) {
        throw new Error('No entry ID available for file uploads');
      }

      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        if (photo.uri.startsWith('http')) {
          // Already uploaded
          photoUrls.push(photo.uri);
        } else {
          try {
            const result = await journalService.uploadJournalPhoto(user.id, finalEntryId, photo.localUri);
            photoUrls.push(result.url);
          } catch (error) {
            console.warn('Failed to upload photo:', error);
          }
        }
      }

      // Upload voice memos
      const voiceMemoUrls: string[] = [];
      const voiceMemoDurations: number[] = [];
      for (const memo of voiceMemos) {
        if (memo.uri.startsWith('http')) {
          // Already uploaded
          voiceMemoUrls.push(memo.uri);
          voiceMemoDurations.push(memo.duration);
        } else {
          try {
            const result = await journalService.uploadJournalVoiceMemo(user.id, finalEntryId, memo.uri);
            voiceMemoUrls.push(result.url);
            voiceMemoDurations.push(memo.duration);
          } catch (error) {
            console.warn('Failed to upload voice memo:', error);
          }
        }
      }

      // Upload PDFs
      const pdfUrls: string[] = [];
      const pdfNames: string[] = [];
      for (const pdf of pdfFiles) {
        if (pdf.uri.startsWith('http')) {
          // Already uploaded
          pdfUrls.push(pdf.uri);
          pdfNames.push(pdf.name);
        } else {
          try {
            const result = await journalService.uploadJournalPdf(user.id, finalEntryId, pdf.uri, pdf.name);
            pdfUrls.push(result.url);
            pdfNames.push(pdf.name);
          } catch (error) {
            console.warn('Failed to upload PDF:', error);
          }
        }
      }

      // Update entry with file URLs if any files were uploaded
      if (photoUrls.length > 0 || voiceMemoUrls.length > 0 || pdfUrls.length > 0) {
        const updateData: Partial<JournalEntry> = {
          photoUrls,
          voiceMemoUrls,
          voiceMemoDurations,
          pdfUrls,
          pdfNames,
        };
        await journalService.updateJournalEntry(finalEntryId, updateData);
      }

      Alert.alert('Success', 'Journal entry saved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entryId) return;

    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await journalService.deleteJournalEntry(entryId);
              Alert.alert('Success', 'Journal entry deleted', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry');
            }
          }
        }
      ]
    );
  };

  // Photo handling functions
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to add photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = {
          uri: result.assets[0].uri,
          localUri: result.assets[0].uri
        };
        setPhotos([...photos, newPhoto]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = {
          uri: result.assets[0].uri,
          localUri: result.assets[0].uri
        };
        setPhotos([...photos, newPhoto]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permissions to record audio');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        const newVoiceMemo = {
          uri,
          duration: recordingDuration
        };
        setVoiceMemos([...voiceMemos, newVoiceMemo]);
      }

      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const removeVoiceMemo = (index: number) => {
    const updatedMemos = [...voiceMemos];
    updatedMemos.splice(index, 1);
    setVoiceMemos(updatedMemos);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const transcribeVoiceMemo = async (index: number) => {
    const memo = voiceMemos[index];
    if (!memo || transcribing[index]) return;

    setTranscribing(prev => ({ ...prev, [index]: true }));

    try {
      const result = await transcriptionService.transcribeAudio(memo.uri);

      // Update the voice memo with transcription
      const updatedMemos = [...voiceMemos];
      updatedMemos[index] = { ...memo, transcription: result.text };
      setVoiceMemos(updatedMemos);

      // Optionally add transcription to notes
      if (result.text && result.text !== "This is a placeholder transcription. Implement actual speech-to-text service here.") {
        const currentNotes = entry.notes || '';
        const newNotes = currentNotes ? `${currentNotes}\n\n[Voice transcription]: ${result.text}` : `[Voice transcription]: ${result.text}`;
        setEntry({ ...entry, notes: newNotes });
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      Alert.alert('Transcription Failed', 'Unable to transcribe voice memo. Please try again.');
    } finally {
      setTranscribing(prev => ({ ...prev, [index]: false }));
    }
  };

  // PDF/Document handling functions
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/markdown', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newPdf = {
          uri: asset.uri,
          name: asset.name
        };
        setPdfFiles([...pdfFiles, newPdf]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const removePdf = (index: number) => {
    const updatedPdfs = [...pdfFiles];
    updatedPdfs.splice(index, 1);
    setPdfFiles(updatedPdfs);
  };

  // Emotion handling
  const toggleEmotion = (emotionValue: string) => {
    const updatedEmotions = selectedEmotions.includes(emotionValue)
      ? selectedEmotions.filter(e => e !== emotionValue)
      : [...selectedEmotions, emotionValue];
    setSelectedEmotions(updatedEmotions);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {entryId ? 'Edit Entry' : 'New Entry'}
          </Text>
          {entryId && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Note Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Quick Note</Text>
            <TextInput
              style={styles.quickNoteInput}
              value={quickNote}
              onChangeText={setQuickNote}
              placeholder="Quick thought or feeling..."
              multiline
              maxLength={200}
            />
          </View>

          {/* Mood Section */}
          <View style={styles.section}>
            <Text style={styles.label}>How are you feeling?</Text>
            <View style={styles.moodContainer}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodButton,
                    { borderColor: mood.color },
                    entry.mood === mood.value && { backgroundColor: mood.color }
                  ]}
                  onPress={() => setEntry({ ...entry, mood: mood.value })}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodButtonText,
                      entry.mood === mood.value && styles.moodButtonTextSelected
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Emotions Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Emotions (optional)</Text>
            <View style={styles.emotionsContainer}>
              {EMOTION_OPTIONS.map((emotion) => (
                <TouchableOpacity
                  key={emotion.value}
                  style={[
                    styles.emotionChip,
                    selectedEmotions.includes(emotion.value) && styles.emotionChipSelected
                  ]}
                  onPress={() => toggleEmotion(emotion.value)}
                >
                  <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                  <Text
                    style={[
                      styles.emotionText,
                      selectedEmotions.includes(emotion.value) && styles.emotionTextSelected
                    ]}
                  >
                    {emotion.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sleep Quality Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Sleep Quality (optional)</Text>
            <View style={styles.sleepContainer}>
              {SLEEP_OPTIONS.map((sleep) => (
                <TouchableOpacity
                  key={sleep.value}
                  style={[
                    styles.sleepButton,
                    { borderColor: sleep.color },
                    entry.sleep === sleep.value && { backgroundColor: sleep.color }
                  ]}
                  onPress={() => setEntry({ ...entry, sleep: sleep.value })}
                >
                  <Text style={styles.sleepEmoji}>{sleep.emoji}</Text>
                  <Text
                    style={[
                      styles.sleepButtonText,
                      entry.sleep === sleep.value && styles.sleepButtonTextSelected
                    ]}
                  >
                    {sleep.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Detailed Notes Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Detailed Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={entry.notes || ''}
              onChangeText={(text) => setEntry({ ...entry, notes: text })}
              placeholder="Write about your day, thoughts, experiences..."
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Voice Recording Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Voice Notes</Text>
              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={20}
                  color={isRecording ? "#fff" : "#4CAF50"}
                />
                <Text style={[styles.recordButtonText, isRecording && styles.recordButtonTextActive]}>
                  {isRecording ? `Recording ${formatDuration(recordingDuration)}` : 'Record'}
                </Text>
              </TouchableOpacity>
            </View>

            {voiceMemos.length > 0 && (
              <View style={styles.mediaList}>
                {voiceMemos.map((memo, index) => (
                  <View key={index} style={styles.voiceMemoItem}>
                    <View style={styles.voiceMemoHeader}>
                      <Ionicons name="musical-notes" size={20} color="#666" />
                      <Text style={styles.mediaText}>Voice memo {formatDuration(memo.duration)}</Text>
                      <View style={styles.voiceMemoActions}>
                        <TouchableOpacity
                          style={styles.transcribeButton}
                          onPress={() => transcribeVoiceMemo(index)}
                          disabled={transcribing[index]}
                        >
                          {transcribing[index] ? (
                            <ActivityIndicator size="small" color="#4CAF50" />
                          ) : (
                            <Ionicons name="text" size={16} color="#4CAF50" />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeVoiceMemo(index)}>
                          <Ionicons name="trash-outline" size={16} color="#F44336" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {memo.transcription && (
                      <View style={styles.transcriptionContainer}>
                        <Text style={styles.transcriptionLabel}>Transcription:</Text>
                        <Text style={styles.transcriptionText}>{memo.transcription}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Photos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Photos</Text>
              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                  <Ionicons name="images" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </View>

            {photos.length > 0 && (
              <View style={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo.localUri }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Documents Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Documents</Text>
              <TouchableOpacity style={styles.mediaButton} onPress={pickDocument}>
                <Ionicons name="document-attach" size={20} color="#4CAF50" />
                <Text style={styles.mediaButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {pdfFiles.length > 0 && (
              <View style={styles.mediaList}>
                {pdfFiles.map((pdf, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Ionicons name="document-text" size={20} color="#666" />
                    <Text style={styles.mediaText} numberOfLines={1}>{pdf.name}</Text>
                    <TouchableOpacity onPress={() => removePdf(index)}>
                      <Ionicons name="trash-outline" size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Share with Coach Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.shareToggle}
              onPress={() => setEntry({ ...entry, sharedWithCoach: !entry.sharedWithCoach })}
            >
              <View style={styles.shareToggleContent}>
                <Ionicons
                  name={entry.sharedWithCoach ? "eye" : "eye-off"}
                  size={20}
                  color={entry.sharedWithCoach ? "#4CAF50" : "#666"}
                />
                <Text style={[styles.shareToggleText, entry.sharedWithCoach && styles.shareToggleTextActive]}>
                  Share with coach
                </Text>
              </View>
              <View style={[styles.toggle, entry.sharedWithCoach && styles.toggleActive]}>
                <View style={[styles.toggleThumb, entry.sharedWithCoach && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Entry</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
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
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickNoteInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#fff',
    minHeight: 70,
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  moodButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  emotionChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  emotionEmoji: {
    fontSize: 16,
  },
  emotionText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  emotionTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  sleepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sleepButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#fff',
    minHeight: 70,
    justifyContent: 'center',
  },
  sleepEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  sleepButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  sleepButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
    gap: 6,
  },
  recordButtonActive: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  recordButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  recordButtonTextActive: {
    color: '#fff',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
    gap: 4,
  },
  mediaButtonText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  mediaList: {
    gap: 8,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 12,
  },
  mediaText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  voiceMemoItem: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  voiceMemoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceMemoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  transcribeButton: {
    padding: 4,
  },
  transcriptionContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e8f5e8',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  transcriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  transcriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  shareToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareToggleText: {
    fontSize: 16,
    color: '#666',
  },
  shareToggleTextActive: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default JournalEntryScreen;
