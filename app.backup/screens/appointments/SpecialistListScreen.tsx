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
  specialistService
} from '../../services/api';

export type SpecialistType = 'mental' | 'physical';

// No mock data - using real API endpoints only

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
      console.log('Fetching care providers for specialty:', type);

      // Use the aligned care providers API directly
      const careProviders = await specialistService.getCareProviders(
        type === 'mental' ? 'mental' : 'physical'
      );
      console.log('Fetched care providers:', careProviders);

      // Convert care providers to specialist format for backward compatibility
      const convertedSpecialists = careProviders.map(provider => ({
        id: provider.id,
        name: provider.user_name || provider.name || 'Unknown Provider',
        email: provider.user_email || provider.email || '',
        specialist_type: provider.specialty || type,
        specialty: provider.specialty,
        bio: provider.bio || `${provider.specialty} Health Specialist`,
        hourly_rate: provider.hourly_rate || 10000, // Rate in cents
        // Include additional care provider fields
        license_number: provider.license_number,
        years_experience: provider.years_experience,
        education: provider.education,
        certifications: provider.certifications,
        is_accepting_patients: provider.is_accepting_patients,
      }));

      setSpecialists(convertedSpecialists);
    } catch (error) {
      console.error('Error fetching care providers:', error);
      // No fallback data - show empty list
      setSpecialists([]);
      Alert.alert('Error', 'Failed to load specialists. Please check your connection and try again.');
    } finally {
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
        source={require('../../../assets/default-avatar.png')}
        style={styles.specialistPhoto}
      />
      <View style={styles.specialistInfo}>
        <Text style={styles.specialistName}>{item.name}</Text>
        <Text style={styles.specialistTitle}>{`${item.specialty} Health Specialist`}</Text>
        {item.bio && (
          <Text style={styles.specialistDescription} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
        <View style={styles.rateContainer}>
          <Ionicons name="cash-outline" size={16} color="#666" style={styles.rateIcon} />
          <Text style={styles.rateText}>
            ${Math.floor((item.hourly_rate || 10000) / 100)}/hour
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
