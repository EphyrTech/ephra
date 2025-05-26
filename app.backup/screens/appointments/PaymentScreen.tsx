import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../../hooks/useAuth';
import {
  processAppointmentPayment,
  calculateAppointmentPrice,
  formatPrice
} from '../../services/stripeService';
import { addAppointmentToCalendar } from '../../services/googleCalendarService';

interface PaymentScreenProps {
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
    };
  };
  navigation: any;
}

const PaymentScreen = ({ route, navigation }: PaymentScreenProps) => {
  const { specialist, startTime, endTime, duration, title, description } = route.params;
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentSheetReady, setPaymentSheetReady] = useState(false);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    // Calculate the price based on specialist type and duration
    const calculatedPrice = calculateAppointmentPrice(specialist.type, duration);
    setPrice(calculatedPrice);
    
    // Initialize the payment sheet
    initializePaymentSheet(calculatedPrice);
  }, [specialist, duration]);

  const initializePaymentSheet = async (amount: number) => {
    try {
      setLoading(true);
      
      // Process the payment and get the client secret
      const { clientSecret, success } = await processAppointmentPayment(
        amount * 100, // Stripe uses cents
        'usd',
        {
          specialist,
          startTime,
          endTime,
          duration,
          title,
          description
        }
      );
      
      if (!success || !clientSecret) {
        throw new Error('Failed to process payment');
      }
      
      // Initialize the payment sheet
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Ephra Health',
        style: 'automatic',
        defaultBillingDetails: {
          name: user?.displayName || '',
          email: user?.email || '',
        }
      });
      
      if (error) {
        console.error('Error initializing payment sheet:', error);
        Alert.alert('Error', 'There was an error setting up the payment. Please try again.');
      } else {
        setPaymentSheetReady(true);
      }
    } catch (error) {
      console.error('Error in initializePaymentSheet:', error);
      Alert.alert('Error', 'There was an error setting up the payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentSheetReady) {
      Alert.alert('Error', 'Payment is not ready yet. Please wait or try again.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Present the payment sheet
      const { error } = await presentPaymentSheet();
      
      if (error) {
        console.error('Payment error:', error);
        Alert.alert('Payment Failed', error.message || 'There was an error processing your payment.');
        setLoading(false);
        return;
      }
      
      // Payment successful, create calendar event with Google Meet
      const { meetLink } = await addAppointmentToCalendar(
        specialist,
        startTime,
        endTime,
        title,
        description
      );
      
      // Show success message
      Alert.alert(
        'Payment Successful',
        'Your appointment has been scheduled successfully.',
        [
          {
            text: 'View Meet Link',
            onPress: () => {
              // Navigate to appointment confirmation screen
              navigation.navigate('AppointmentConfirmation', {
                specialist,
                startTime,
                endTime,
                duration,
                title,
                description,
                meetLink,
                price
              });
            }
          }
        ]
      );
      
      setLoading(false);
    } catch (error) {
      console.error('Error in handlePayment:', error);
      Alert.alert('Error', 'There was an error processing your payment. Please try again.');
      setLoading(false);
    }
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
        <Text style={styles.title}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.specialistInfo}>
              <Text style={styles.specialistName}>{specialist.name}</Text>
              <Text style={styles.specialistTitle}>{specialist.title}</Text>
            </View>
            
            <View style={styles.appointmentDetails}>
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
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentCard}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Total Amount:</Text>
              <Text style={styles.priceValue}>{formatPrice(price)}</Text>
            </View>
            
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentMethodTitle}>Payment Method:</Text>
              <View style={styles.cardIcons}>
                <Image
                  source={require('../../../assets/visa.png')}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <Image
                  source={require('../../../assets/mastercard.png')}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <Image
                  source={require('../../../assets/amex.png')}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
            
            <Text style={styles.securePaymentText}>
              <Ionicons name="lock-closed" size={14} color="#666" /> Secure payment processed by Stripe
            </Text>
          </View>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By proceeding with payment, you agree to our Terms of Service and Cancellation Policy.
            Appointments can be cancelled up to 24 hours before the scheduled time for a full refund.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, (loading || !paymentSheetReady) && styles.disabledButton]}
          onPress={handlePayment}
          disabled={loading || !paymentSheetReady}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Pay {formatPrice(price)}</Text>
              <Ionicons name="card-outline" size={20} color="#fff" style={styles.payButtonIcon} />
            </>
          )}
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
  content: {
    flex: 1,
    padding: 16,
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
  summaryCard: {
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
  appointmentDetails: {
    marginTop: 8,
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
  paymentCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#333',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  paymentMethod: {
    marginBottom: 16,
  },
  paymentMethodTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 25,
    marginRight: 8,
  },
  securePaymentText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  termsSection: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  payButtonIcon: {
    marginLeft: 8,
  },
});

export default PaymentScreen;
