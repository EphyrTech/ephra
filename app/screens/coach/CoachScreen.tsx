import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CoachScreen = ({ navigation }: any) => {
  const handleScheduleAppointment = () => {
    navigation.navigate('SpecialistType');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Specialists</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Schedule an Appointment</Text>
            <Text style={styles.bannerText}>
              Connect with mental and physical health specialists for personalized care.
            </Text>
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={handleScheduleAppointment}
            >
              <Text style={styles.scheduleButtonText}>Schedule Now</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.bannerImageContainer}>
            <Ionicons name="people" size={80} color="#4CAF50" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Our Services</Text>

        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => navigation.navigate('SpecialistType')}
        >
          <View style={styles.serviceIconContainer}>
            <Ionicons name="brain" size={32} color="#4CAF50" />
          </View>
          <View style={styles.serviceContent}>
            <Text style={styles.serviceTitle}>Mental Health</Text>
            <Text style={styles.serviceDescription}>
              Connect with psychologists, therapists, and counselors.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.serviceCard}
          onPress={() => navigation.navigate('SpecialistType')}
        >
          <View style={styles.serviceIconContainer}>
            <Ionicons name="fitness" size={32} color="#4CAF50" />
          </View>
          <View style={styles.serviceContent}>
            <Text style={styles.serviceTitle}>Physical Health</Text>
            <Text style={styles.serviceDescription}>
              Connect with physicians, physical therapists, and nutritionists.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>

        <View style={styles.emptyAppointments}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No upcoming appointments</Text>
          <Text style={styles.emptySubtext}>
            Schedule your first appointment to get started
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleScheduleAppointment}
          >
            <Text style={styles.emptyButtonText}>Schedule Now</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bannerContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 2,
  },
  bannerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  scheduleButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  serviceCard: {
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
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyAppointments: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CoachScreen;
