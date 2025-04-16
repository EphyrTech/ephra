import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Specialist,
  SpecialistType
} from '../../services/firebase/specialistService';

// Mock data for specialists
const MOCK_SPECIALISTS: Record<SpecialistType, Specialist[]> = {
  mental: [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      type: 'mental',
      title: 'Clinical Psychologist',
      description: 'Specializes in anxiety, depression, and trauma therapy with 10+ years of experience.',
      photoUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      rating: 4.8,
      hourlyRate: 120, // $120 per hour
      currency: 'usd',
      availability: generateMockAvailability()
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      type: 'mental',
      title: 'Psychiatrist',
      description: 'Board-certified psychiatrist specializing in mood disorders and medication management.',
      photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      rating: 4.7,
      hourlyRate: 150, // $150 per hour
      currency: 'usd',
      availability: generateMockAvailability()
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      type: 'mental',
      title: 'Licensed Therapist',
      description: 'Specializes in cognitive behavioral therapy and mindfulness-based approaches.',
      photoUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
      rating: 4.9,
      hourlyRate: 100, // $100 per hour
      currency: 'usd',
      availability: generateMockAvailability()
    }
  ],
  physical: [
    {
      id: '4',
      name: 'Dr. James Wilson',
      type: 'physical',
      title: 'Physical Therapist',
      description: 'Specializes in sports injuries and rehabilitation with a focus on holistic recovery.',
      photoUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
      rating: 4.6,
      hourlyRate: 90, // $90 per hour
      currency: 'usd',
      availability: generateMockAvailability()
    },
    {
      id: '5',
      name: 'Dr. Lisa Patel',
      type: 'physical',
      title: 'Nutritionist',
      description: 'Registered dietitian specializing in personalized nutrition plans and wellness coaching.',
      photoUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
      rating: 4.8,
      hourlyRate: 85, // $85 per hour
      currency: 'usd',
      availability: generateMockAvailability()
    },
    {
      id: '6',
      name: 'Dr. Robert Thompson',
      type: 'physical',
      title: 'Physician',
      description: 'Board-certified physician with expertise in preventive medicine and chronic disease management.',
      photoUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
      rating: 4.9,
      hourlyRate: 110, // $110 per hour
      currency: 'usd',
      availability: generateMockAvailability()
    }
  ]
};

// Function to generate mock availability
function generateMockAvailability() {
  const availability = [];
  const now = new Date();

  // Generate availability for the next 14 days
  for (let i = 1; i <= 14; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Generate 3-5 time slots per day
    const numSlots = Math.floor(Math.random() * 3) + 3;

    // Start times (9 AM to 4 PM)
    const startHours = [9, 10, 11, 13, 14, 15, 16];

    // Randomly select time slots
    const selectedHours = [];
    while (selectedHours.length < numSlots && startHours.length > 0) {
      const randomIndex = Math.floor(Math.random() * startHours.length);
      selectedHours.push(startHours[randomIndex]);
      startHours.splice(randomIndex, 1);
    }

    // Sort hours in ascending order
    selectedHours.sort((a, b) => a - b);

    // Create time slots
    for (const hour of selectedHours) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 60);

      availability.push({
        startTime,
        endTime,
        isBooked: false
      });
    }
  }

  return availability;
}

const SpecialistListScreen = ({ route, navigation }: any) => {
  const { type } = route.params;
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecialists();
  }, [type]);

  const fetchSpecialists = async () => {
    setLoading(true);
    try {
      // Use mock data instead of Firebase
      setTimeout(() => {
        setSpecialists(MOCK_SPECIALISTS[type as SpecialistType] || []);
        setLoading(false);
      }, 1000); // Simulate network delay
    } catch (error) {
      console.error('Error fetching specialists:', error);
      Alert.alert('Error', 'Failed to load specialists. Please try again.');
      setLoading(false);
    }
  };

  const handleSpecialistSelect = (specialist: Specialist) => {
    navigation.navigate('SpecialistAvailability', { specialist });
  };

  const renderSpecialistItem = ({ item }: { item: Specialist }) => (
    <TouchableOpacity
      style={styles.specialistCard}
      onPress={() => handleSpecialistSelect(item)}
    >
      <Image
        source={
          item.photoUrl
            ? { uri: item.photoUrl }
            : require('../../../assets/default-avatar.png')
        }
        defaultSource={require('../../../assets/default-avatar.png')}
        style={styles.specialistPhoto}
      />
      <View style={styles.specialistInfo}>
        <Text style={styles.specialistName}>{item.name}</Text>
        <Text style={styles.specialistTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.specialistDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.rating && (
          <View style={styles.ratingContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Ionicons
                key={`star-${item.id}-${index}`}
                name={index < Math.floor(item.rating ?? 0) ? 'star' : 'star-outline'}
                size={16}
                color={index < Math.floor(item.rating ?? 0) ? '#FFC107' : '#ccc'}
                style={styles.starIcon}
              />
            ))}
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
        <View style={styles.rateContainer}>
          <Ionicons name="cash-outline" size={16} color="#666" style={styles.rateIcon} />
          <Text style={styles.rateText}>
            ${item.hourlyRate ?? (item.type === 'mental' ? 100 : 80)}/hour
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No specialists available</Text>
      <Text style={styles.emptySubtext}>
        Please check back later or try a different specialist type
      </Text>
    </View>
  );

  const getTypeTitle = (type: SpecialistType) => {
    return type === 'mental' ? 'Mental Health Specialists' : 'Physical Health Specialists';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{getTypeTitle(type as SpecialistType)}</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={specialists}
          renderItem={renderSpecialistItem}
          keyExtractor={item => item.id ?? ''}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  specialistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  specialistPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  specialistInfo: {
    flex: 1,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialistTitle: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
  },
  specialistDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rateIcon: {
    marginRight: 4,
  },
  rateText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
  },
});

export default SpecialistListScreen;
