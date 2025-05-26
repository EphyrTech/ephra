import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { formatPrice } from '../../services/stripeService';

interface AppointmentConfirmationScreenProps {
  route: {
    params: {
      specialist: {
        id: string;
        name: string;
        type: 'mental' | 'physical';
        title: string;
      };
      startTime: Date;
      endTime: Date;
      duration: number;
      title: string;
      description: string;
      meetLink: string;
      price: number;
    };
  };
  navigation: any;
}

const AppointmentConfirmationScreen = ({ route, navigation }: AppointmentConfirmationScreenProps) => {
  const {
    specialist,
    startTime,
    endTime,
    duration,
    title,
    description,
    meetLink,
    price
  } = route.params;

  const handleOpenMeetLink = () => {
    if (meetLink) {
      Linking.openURL(meetLink);
    }
  };

  const handleShareAppointment = async () => {
    try {
      const message = `I have an appointment with ${specialist.name} (${specialist.title}) on ${format(startTime, 'EEEE, MMMM d, yyyy')} at ${format(startTime, 'h:mm a')}. Join me via Google Meet: ${meetLink}`;
      
      await Share.share({
        message,
        title: 'My Appointment Details',
      });
    } catch (error) {
      console.error('Error sharing appointment:', error);
    }
  };

  const handleDone = () => {
    // Navigate to the calendar screen
    navigation.navigate('Calendar');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.title}>Appointment Confirmed</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDone}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <Text style={styles.successMessage}>
            Your appointment has been scheduled successfully.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.specialistInfo}>
              <Text style={styles.specialistName}>{specialist.name}</Text>
              <Text style={styles.specialistTitle}>{specialist.title}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
              <Text style={styles.detailText}>
                {format(startTime, 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#4CAF50" />
              <Text style={styles.detailText}>
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="hourglass-outline" size={20} color="#4CAF50" />
              <Text style={styles.detailText}>
                {duration} minutes
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={20} color="#4CAF50" />
              <Text style={styles.detailText}>
                {formatPrice(price)}
              </Text>
            </View>
            
            {description && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{description}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Google Meet Link</Text>
          <View style={styles.meetLinkContainer}>
            <Text style={styles.meetLink} numberOfLines={1} ellipsizeMode="middle">
              {meetLink}
            </Text>
            <TouchableOpacity
              style={styles.openLinkButton}
              onPress={handleOpenMeetLink}
            >
              <Ionicons name="open-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.meetLinkInfo}>
            This link will be used for your virtual appointment. You can also find it in your Google Calendar.
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareAppointment}
          >
            <Ionicons name="share-social-outline" size={20} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Share Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
            <Text style={styles.actionButtonText}>View in Calendar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  specialistInfo: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
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
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  notesContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
  },
  meetLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  meetLink: {
    flex: 1,
    fontSize: 14,
    color: '#3F51B5',
    marginRight: 8,
  },
  openLinkButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
  },
  meetLinkInfo: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AppointmentConfirmationScreen;
