import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import {
  JournalEntry,
  journalService
} from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
// No need to import Timestamp as we're using type checking instead

// Mood options for the journal entry (main moods)
const MOOD_OPTIONS = [
  { label: 'rad', value: 'rad', icon: 'happy', color: '#A0A0A0' },
  { label: 'good', value: 'good', icon: 'happy-outline', color: '#4CAF50' },
  { label: 'meh', value: 'meh', icon: 'remove-outline', color: '#A0A0A0' },
  { label: 'bad', value: 'bad', icon: 'sad-outline', color: '#A0A0A0' },
  { label: 'awful', value: 'awful', icon: 'sad', color: '#A0A0A0' },
];

// Emotion options for the detailed emotions section
const EMOTION_OPTIONS = [
  { label: 'happy', value: 'happy', icon: 'heart-outline', color: '#9C27B0' },
  { label: 'excited', value: 'excited', icon: 'sparkles', color: '#9C27B0' },
  { label: 'grateful', value: 'grateful', icon: 'heart', color: '#9C27B0' },
  { label: 'relaxed', value: 'relaxed', icon: 'umbrella-beach', color: '#9C27B0' },
  { label: 'content', value: 'content', icon: 'thumbs-up', color: '#9C27B0' },
  { label: 'tired', value: 'tired', icon: 'bed-outline', color: '#9C27B0' },
  { label: 'unsure', value: 'unsure', icon: 'help', color: '#9C27B0' },
  { label: 'bored', value: 'bored', icon: 'timer-sand', color: '#9C27B0' },
  { label: 'anxious', value: 'anxious', icon: 'cloud', color: '#9C27B0' },
  { label: 'angry', value: 'angry', icon: 'volcano', color: '#9C27B0' },
  { label: 'stressed', value: 'stressed', icon: 'head-question', color: '#9C27B0' },
  { label: 'sad', value: 'sad', icon: 'water', color: '#9C27B0' },
  { label: 'desperate', value: 'desperate', icon: 'alert', color: '#9C27B0' },
];

// Sleep options for the sleep tracking section
const SLEEP_OPTIONS = [
  { label: 'good sleep', value: 'good_sleep', icon: 'sleep', color: '#9C27B0' },
  { label: 'medium sleep', value: 'medium_sleep', icon: 'bed-outline', color: '#9C27B0' },
  { label: 'bad sleep', value: 'bad_sleep', icon: 'bed', color: '#9C27B0' },
  { label: 'sleep early', value: 'sleep_early', icon: 'alarm', color: '#9C27B0' },
];

const JournalEntryScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { entry: existingEntry, entryId, date: selectedDate } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emotionsExpanded, setEmotionsExpanded] = useState(true);
  const [sleepExpanded, setSleepExpanded] = useState(true);
  const [photosExpanded, setPhotosExpanded] = useState(true);
  const [voiceMemosExpanded, setVoiceMemosExpanded] = useState(true);
  const [pdfFilesExpanded, setPdfFilesExpanded] = useState(true);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [quickNote, setQuickNote] = useState('');
  const [photos, setPhotos] = useState<{uri: string; localUri: string}[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [voiceMemos, setVoiceMemos] = useState<{uri: string; duration: number}[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [pdfFiles, setPdfFiles] = useState<{uri: string; name: string}[]>([]);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    title: '', // Required field for API
    mood: 'good',
    notes: '',
    quickNote: '',
    sharedWithCoach: false,
    photoUrls: [],
    voiceMemoUrls: [],
    voiceMemoDurations: [],
    pdfUrls: [],
    pdfNames: [],
    emotions: [],
    sleep: '',
  });

  // Fetch entry details by ID if entryId is provided
  useEffect(() => {
    const fetchEntryDetails = async () => {
      if (entryId && !existingEntry) {
        console.log('JournalEntry: Fetching entry details for ID:', entryId);
        setLoading(true);
        try {
          const entryDetails = await journalService.getJournalEntry(entryId);
          console.log('JournalEntry: Fetched entry details:', entryDetails);
          setEntry(entryDetails);

          // Initialize all the form fields with the fetched data
          if (entryDetails.emotions) {
            setSelectedEmotions(entryDetails.emotions);
          }

          const noteText = entryDetails.quickNote || entryDetails.notes || entryDetails.content || '';
          if (noteText) {
            setQuickNote(noteText);
          }

          // Initialize photos
          if (entryDetails.photoUrls && entryDetails.photoUrls.length > 0) {
            const existingPhotos = entryDetails.photoUrls.map(url => ({
              uri: url,
              localUri: url
            }));
            setPhotos(existingPhotos);
          }

          // Initialize voice memos
          if (entryDetails.voiceMemoUrls && entryDetails.voiceMemoUrls.length > 0 &&
              entryDetails.voiceMemoDurations && entryDetails.voiceMemoDurations.length > 0) {
            const existingMemos = entryDetails.voiceMemoUrls.map((url, index) => ({
              uri: url,
              duration: entryDetails.voiceMemoDurations?.[index] || 0
            }));
            setVoiceMemos(existingMemos);
          }

          // Initialize PDF files
          if (entryDetails.pdfUrls && entryDetails.pdfUrls.length > 0 &&
              entryDetails.pdfNames && entryDetails.pdfNames.length > 0) {
            const existingPdfs = entryDetails.pdfUrls.map((url, index) => ({
              uri: url,
              name: entryDetails.pdfNames?.[index] || 'Document.pdf'
            }));
            setPdfFiles(existingPdfs);
          }
        } catch (error) {
          console.error('JournalEntry: Error fetching entry details:', error);
          Alert.alert('Error', 'Failed to load journal entry details');
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEntryDetails();
  }, [entryId, existingEntry]);

  // Initialize the entry date from the route params or use current date
  useEffect(() => {
    if (existingEntry) {
      // Edit existing entry
      setEntry(existingEntry);
      // Initialize selected emotions from existing entry
      if (existingEntry.emotions) {
        setSelectedEmotions(existingEntry.emotions);
      }
      // Initialize quick note if it exists (check multiple fields for compatibility)
      const noteText = existingEntry.quickNote || existingEntry.notes || existingEntry.content || '';
      if (noteText) {
        setQuickNote(noteText);
      }
      // Initialize photos if they exist
      if (existingEntry.photoUrls && existingEntry.photoUrls.length > 0) {
        const existingPhotos = existingEntry.photoUrls.map(url => ({
          uri: url,
          localUri: url
        }));
        setPhotos(existingPhotos);
      }
      // Initialize voice memos if they exist
      if (existingEntry.voiceMemoUrls && existingEntry.voiceMemoUrls.length > 0 &&
          existingEntry.voiceMemoDurations && existingEntry.voiceMemoDurations.length > 0) {
        const existingMemos = existingEntry.voiceMemoUrls.map((url, index) => ({
          uri: url,
          duration: existingEntry.voiceMemoDurations?.[index] || 0
        }));
        setVoiceMemos(existingMemos);
      }
      // Initialize PDF files if they exist
      if (existingEntry.pdfUrls && existingEntry.pdfUrls.length > 0 &&
          existingEntry.pdfNames && existingEntry.pdfNames.length > 0) {
        const existingPdfs = existingEntry.pdfUrls.map((url, index) => ({
          uri: url,
          name: existingEntry.pdfNames?.[index] || 'Document.pdf'
        }));
        setPdfFiles(existingPdfs);
      }
    } else if (selectedDate) {
      // Create new entry for selected date
      setEntry(prev => ({
        ...prev,
        date: selectedDate,
      }));
    } else {
      // Create new entry for current date
      setEntry(prev => ({
        ...prev,
        date: new Date(),
      }));
    }
  }, [existingEntry, selectedDate]);

  // We don't need to fetch existing entries for the date anymore
  // since we're allowing multiple entries per day
  useEffect(() => {
    if (selectedDate && !existingEntry) {
      // Just create a new entry with the selected date
      setEntry(prev => ({
        ...prev,
        date: selectedDate,
      }));
      setLoading(false);
    }
  }, [selectedDate, existingEntry]);

  const handleSave = async () => {
    console.log('handleSave called, user:', user);

    if (!user) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to save journal entries. Would you like to sign in now?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => {
              // Navigate to the auth screen
              navigation.navigate('Auth');
            }
          }
        ]
      );
      return;
    }

    if (!entry.mood || (!entry.notes && !quickNote)) {
      Alert.alert('Missing Information', 'Please select a mood and add some notes');
      return;
    }

    // Ensure title is set (required by API)
    if (!entry.title || entry.title.trim() === '') {
      const defaultTitle = `Journal Entry - ${format(new Date(), 'MMM d, yyyy')}`;
      setEntry(prev => ({ ...prev, title: defaultTitle }));
    }

    setSaving(true);
    console.log('Starting to save journal entry...');
    console.log('Entry mood:', entry.mood);
    console.log('Quick note:', quickNote);
    console.log('Entry notes:', entry.notes);

    try {
      // Safely handle date conversion
      let entryDate: Date;
      if (entry.date instanceof Date) {
        entryDate = entry.date;
      } else if (entry.date && typeof entry.date === 'object' && 'seconds' in entry.date) {
        entryDate = new Date(entry.date.seconds * 1000);
      } else {
        entryDate = new Date();
      }

      // Upload photos if there are any new ones
      const photoPromises = photos.map(async (photo) => {
        // Only upload photos that don't already have a URL
        if (!photo.uri.startsWith('http')) {
          try {
            const entryId = entry.id || 'new';
            const result = await journalService.uploadJournalPhoto(user.id, entryId, photo.localUri);
            return result.url;
          } catch (error) {
            console.error('Error uploading photo:', error);
            return null;
          }
        }
        return photo.uri;
      });

      // Wait for all photo uploads to complete
      const uploadedPhotoUrls = await Promise.all(photoPromises);
      const validPhotoUrls = uploadedPhotoUrls.filter(url => url !== null) as string[];

      // Prepare voice memo and PDF data
      const voiceMemoUrls = voiceMemos.map(memo => memo.uri);
      const voiceMemoDurations = voiceMemos.map(memo => memo.duration);
      const pdfUrls = pdfFiles.map(pdf => pdf.uri);
      const pdfNames = pdfFiles.map(pdf => pdf.name);

      const entryData: JournalEntry = {
        user_id: user.id,
        title: entry.title || `Journal Entry - ${format(entryDate, 'MMM d, yyyy')}`, // Use existing title or generate one
        mood: entry.mood ?? 'good',
        notes: quickNote || entry.notes || '',
        content: quickNote || entry.notes || '', // For API compatibility
        quickNote: quickNote,
        date: entryDate,
        sharedWithCoach: entry.sharedWithCoach ?? false,
        photoUrls: validPhotoUrls,
        voiceMemoUrls: voiceMemoUrls,
        voiceMemoDurations: voiceMemoDurations,
        pdfUrls: pdfUrls,
        pdfNames: pdfNames,
        emotions: entry.emotions ?? [],
        sleep: entry.sleep ?? '',
        ...(entry.id && { id: entry.id }),
      };

      console.log('Sending entry data to API:', entryData);

      if (entry.id) {
        // Update existing entry
        console.log('Updating existing entry with ID:', entry.id);
        await journalService.updateJournalEntry(entry.id, entryData);
      } else {
        // Create new entry
        console.log('Creating new entry');
        const result = await journalService.createJournalEntry(entryData);
        console.log('Entry created successfully:', result);
      }

      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error('Error saving journal entry:', error);

      // Show a more detailed error message
      Alert.alert(
        'Save Failed',
        'Unable to save your journal entry. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMoodSelect = (mood: string) => {
    setEntry(prev => ({ ...prev, mood }));
  };

  const handleEmotionSelect = (emotion: string) => {
    // Toggle the emotion in the selectedEmotions array
    if (selectedEmotions.includes(emotion)) {
      const updatedEmotions = selectedEmotions.filter(e => e !== emotion);
      setSelectedEmotions(updatedEmotions);
      setEntry(prev => ({ ...prev, emotions: updatedEmotions }));
    } else {
      const updatedEmotions = [...selectedEmotions, emotion];
      setSelectedEmotions(updatedEmotions);
      setEntry(prev => ({ ...prev, emotions: updatedEmotions }));
    }
  };

  const handleSleepSelect = (sleep: string) => {
    setEntry(prev => ({ ...prev, sleep }));
  };

  const toggleSection = (section: 'emotions' | 'sleep' | 'photos' | 'voiceMemos' | 'pdfFiles') => {
    if (section === 'emotions') {
      setEmotionsExpanded(!emotionsExpanded);
    } else if (section === 'sleep') {
      setSleepExpanded(!sleepExpanded);
    } else if (section === 'photos') {
      setPhotosExpanded(!photosExpanded);
    } else if (section === 'voiceMemos') {
      setVoiceMemosExpanded(!voiceMemosExpanded);
    } else if (section === 'pdfFiles') {
      setPdfFilesExpanded(!pdfFilesExpanded);
    }
  };

  const toggleShareWithCoach = () => {
    setEntry(prev => ({ ...prev, sharedWithCoach: !prev.sharedWithCoach }));
  };

  // Photo handling functions
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to add photos');
        return;
      }

      // Launch image picker
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
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos');
        return;
      }

      // Launch camera
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

  // Voice memo handling functions
  const startRecording = async () => {
    try {
      // Request permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permissions to record audio');
        return;
      }

      // Set up recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer to track duration
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Stop the timer
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      // Stop recording
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (uri) {
        const newMemo = {
          uri,
          duration: recordingDuration
        };
        setVoiceMemos([...voiceMemos, newMemo]);
      }

      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);

    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to save recording');
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

  // PDF handling functions
  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const newPdf = {
          uri: result.uri,
          name: result.name
        };
        setPdfFiles([...pdfFiles, newPdf]);
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to select PDF');
    }
  };

  const removePdf = (index: number) => {
    const updatedPdfs = [...pdfFiles];
    updatedPdfs.splice(index, 1);
    setPdfFiles(updatedPdfs);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Format the entry date for display - using the same safe conversion as in handleSave
  let displayDate: Date;
  if (entry.date instanceof Date) {
    displayDate = entry.date;
  } else if (entry.date && typeof entry.date === 'object' && 'seconds' in entry.date) {
    displayDate = new Date(entry.date.seconds * 1000);
  } else {
    displayDate = new Date();
  }

  const formattedDate = format(displayDate, 'EEEE, MMMM d, yyyy');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={20} color="#9C27B0" />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.moodContainer}>
              {MOOD_OPTIONS.map(mood => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodOption,
                    entry.mood === mood.value && { backgroundColor: mood.color === '#4CAF50' ? '#4CAF50' : '#333' }
                  ]}
                  onPress={() => handleMoodSelect(mood.value)}
                >
                  {/* Determine icon color based on selection and mood type */}
                  <Ionicons
                    name={mood.icon}
                    size={32}
                    color={entry.mood === mood.value ? (mood.value === 'good' ? '#4CAF50' : '#FFF') : '#999'}
                  />
                  {/* Determine text style based on selection and mood type */}
                  <Text style={[
                    styles.moodLabel,
                    entry.mood === mood.value && {
                      color: mood.value === 'good' ? '#4CAF50' : '#FFF',
                      fontWeight: '600'
                    }
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.editMoodsButton}>
              <Ionicons name="pencil" size={16} color="#9C27B0" />
              <Text style={styles.editMoodsText}>Edit Moods</Text>
            </TouchableOpacity>
          </View>

          {/* Emotions Section */}
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('emotions')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionCardTitle}>Emotions</Text>
              </View>
              <Ionicons
                name={emotionsExpanded ? 'chevron-down' : 'chevron-up'}
                size={24}
                color="#9C27B0"
              />
            </TouchableOpacity>

            {emotionsExpanded && (
              <View style={styles.emotionsGrid}>
                {EMOTION_OPTIONS.map(emotion => (
                  <TouchableOpacity
                    key={emotion.value}
                    style={[
                      styles.emotionOption,
                      selectedEmotions.includes(emotion.value) && styles.selectedEmotionOption
                    ]}
                    onPress={() => handleEmotionSelect(emotion.value)}
                  >
                    <Ionicons
                      name={emotion.icon}
                      size={24}
                      color={selectedEmotions.includes(emotion.value) ? '#FFF' : '#9C27B0'}
                    />
                    <Text style={[
                      styles.emotionLabel,
                      selectedEmotions.includes(emotion.value) && styles.selectedEmotionLabel
                    ]}>
                      {emotion.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Sleep Section */}
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('sleep')}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionCardTitle}>Sleep</Text>
              </View>
              <Ionicons
                name={sleepExpanded ? 'chevron-down' : 'chevron-up'}
                size={24}
                color="#9C27B0"
              />
            </TouchableOpacity>

            {sleepExpanded && (
              <View style={styles.sleepGrid}>
                {SLEEP_OPTIONS.map(sleepOption => (
                  <TouchableOpacity
                    key={sleepOption.value}
                    style={[
                      styles.sleepOption,
                      entry.sleep === sleepOption.value && styles.selectedSleepOption
                    ]}
                    onPress={() => handleSleepSelect(sleepOption.value)}
                  >
                    <Ionicons
                      name={sleepOption.icon}
                      size={24}
                      color={entry.sleep === sleepOption.value ? '#FFF' : '#9C27B0'}
                    />
                    <Text style={[
                      styles.sleepLabel,
                      entry.sleep === sleepOption.value && styles.selectedSleepLabel
                    ]}>
                      {sleepOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quick Note Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="document-text-outline" size={20} color="#333" />
                <Text style={styles.sectionTitle}>Quick Note</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('FullNote', { note: quickNote, onSave: setQuickNote })}>
                <Text style={styles.openFullNoteText}>Open Full Note</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.quickNoteInput}
              placeholder="Add Note..."
              placeholderTextColor="#999"
              value={quickNote}
              onChangeText={setQuickNote}
            />
          </View>

          {/* Photo Section */}
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('photos')}
            >
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="camera-outline" size={20} color="#333" />
                <Text style={styles.sectionCardTitle}>Photo</Text>
              </View>
              <Ionicons
                name={photosExpanded ? 'chevron-down' : 'chevron-up'}
                size={24}
                color="#333"
              />
            </TouchableOpacity>

            {photosExpanded && (
              <View style={styles.photoSection}>
                {photos.length > 0 && (
                  <ScrollView horizontal style={styles.photoList}>
                    {photos.map((photo, index) => (
                      <View key={index} style={styles.photoContainer}>
                        <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                        <TouchableOpacity
                          style={styles.removePhotoButton}
                          onPress={() => removePhoto(index)}
                        >
                          <Ionicons name="close-circle" size={24} color="#FF5252" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <View style={styles.photoButtons}>
                  <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={24} color="#333" />
                    <Text style={styles.photoButtonText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                    <Ionicons name="images" size={24} color="#333" />
                    <Text style={styles.photoButtonText}>From Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Voice Memo Section */}
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('voiceMemos')}
            >
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="mic-outline" size={20} color="#333" />
                <Text style={styles.sectionCardTitle}>Voice Memo</Text>
              </View>
              <Ionicons
                name={voiceMemosExpanded ? 'chevron-down' : 'chevron-up'}
                size={24}
                color="#333"
              />
            </TouchableOpacity>

            {voiceMemosExpanded && (
              <View style={styles.voiceMemoSection}>
                {voiceMemos.length > 0 && (
                  <View style={styles.voiceMemoList}>
                    {voiceMemos.map((memo, index) => (
                      <View key={index} style={styles.voiceMemoItem}>
                        <Ionicons name="play-circle" size={24} color="#4CAF50" />
                        <Text style={styles.voiceMemoDuration}>{formatDuration(memo.duration)}</Text>
                        <TouchableOpacity
                          style={styles.removeVoiceMemoButton}
                          onPress={() => removeVoiceMemo(index)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#FF5252" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.recordButton, isRecording && styles.recordingButton]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <Ionicons
                    name={isRecording ? 'stop-circle' : 'mic'}
                    size={24}
                    color={isRecording ? '#FF5252' : '#333'}
                  />
                  <Text style={styles.recordButtonText}>
                    {isRecording ? `Recording... ${formatDuration(recordingDuration)}` : 'Tap to Record'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* PDF Files Section */}
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('pdfFiles')}
            >
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="document-outline" size={20} color="#333" />
                <Text style={styles.sectionCardTitle}>PDF Files</Text>
              </View>
              <Ionicons
                name={pdfFilesExpanded ? 'chevron-down' : 'chevron-up'}
                size={24}
                color="#333"
              />
            </TouchableOpacity>

            {pdfFilesExpanded && (
              <View style={styles.pdfSection}>
                {pdfFiles.length > 0 && (
                  <View style={styles.pdfList}>
                    {pdfFiles.map((pdf, index) => (
                      <View key={index} style={styles.pdfItem}>
                        <Ionicons name="document" size={24} color="#3F51B5" />
                        <Text style={styles.pdfName} numberOfLines={1} ellipsizeMode="middle">
                          {pdf.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.removePdfButton}
                          onPress={() => removePdf(index)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#FF5252" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.addPdfButton} onPress={pickPdf}>
                  <Ionicons name="add-circle" size={24} color="#3F51B5" />
                  <Text style={styles.addPdfButtonText}>Add PDF</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Journal Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Write about your day, thoughts, feelings..."
              placeholderTextColor="#777"
              multiline
              value={entry.notes}
              onChangeText={(text) => setEntry(prev => ({ ...prev, notes: text }))}
            />
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.shareOption}
              onPress={toggleShareWithCoach}
            >
              <View style={[styles.shareCheckbox, entry.sharedWithCoach && { backgroundColor: '#4CAF50', borderColor: '#4CAF50' }]}>
                {entry.sharedWithCoach && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.shareText}>Share with my coach</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginLeft: 8,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 50,
    width: '18%',
    backgroundColor: '#f5f5f5',
  },
  moodLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  editMoodsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
    alignSelf: 'center',
  },
  editMoodsText: {
    color: '#4CAF50',
    marginLeft: 8,
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  emotionOption: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
  },
  selectedEmotionOption: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
  },
  emotionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedEmotionLabel: {
    color: '#fff',
    fontWeight: '500',
  },
  sleepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-around',
  },
  sleepOption: {
    width: '22%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedSleepOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sleepLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedSleepLabel: {
    color: '#fff',
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shareText: {
    fontSize: 16,
    color: '#333',
  },
  bottomPadding: {
    height: 40,
  },
  // Quick Note styles
  quickNoteInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
    height: 50,
  },
  openFullNoteText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  // Photo section styles
  photoSection: {
    padding: 16,
  },
  photoList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    justifyContent: 'center',
  },
  photoButtonText: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '500',
  },
  // Voice memo styles
  voiceMemoSection: {
    padding: 16,
  },
  voiceMemoList: {
    marginBottom: 16,
  },
  voiceMemoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  voiceMemoDuration: {
    flex: 1,
    marginLeft: 12,
    color: '#333',
  },
  removeVoiceMemoButton: {
    padding: 8,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  recordingButton: {
    backgroundColor: '#ffebee',
  },
  recordButtonText: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '500',
  },
  // PDF styles
  pdfSection: {
    padding: 16,
  },
  pdfList: {
    marginBottom: 16,
  },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pdfName: {
    flex: 1,
    marginLeft: 12,
    color: '#333',
  },
  removePdfButton: {
    padding: 8,
  },
  addPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  addPdfButtonText: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '500',
  },
});

export default JournalEntryScreen;
