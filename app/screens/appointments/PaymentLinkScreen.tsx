import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import {
  processAppointmentPaymentWithLink,
  calculateAppointmentPrice,
  formatPrice,
  openPaymentLink,
  PaymentLinkInfo
} from '../../services/stripeService';
import { addAppointmentToCalendar } from '../../services/googleCalendarService';

interface PaymentLinkScreenProps {
  route: {
    params: {
      specialist: {
        id: string;
        name: string;
        type: 'mental' | 'physical';
        title: string;
        hourlyRate?: number;
        currency?: string;
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

const PaymentLinkScreen = ({ route, navigation }: PaymentLinkScreenProps) => {
  const { specialist, startTime, endTime, duration, title, description } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentLink, setPaymentLink] = useState<PaymentLinkInfo | null>(null);
  const [price, setPrice] = useState({ amount: 0, currency: 'usd' });

  useEffect(() => {
    // Calculate the price based on specialist rate and duration
    const calculatedPrice = calculateAppointmentPrice(specialist, duration);
    setPrice(calculatedPrice);

    // Create payment link
    createPaymentLink();
  }, [specialist, duration]);

  const createPaymentLink = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to book an appointment.');
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      // Process the payment link creation
      const result = await processAppointmentPaymentWithLink(
        user.uid,
        user.email ?? '',
        user.displayName ?? '',
        price.amount * 100, // Convert to cents for Stripe
        price.currency,
        {
          specialist,
          startTime,
          endTime,
          duration,
          title,
          description
        }
      );

      if (result.success && result.paymentLink) {
        setPaymentLink(result.paymentLink);
      } else {
        throw new Error('Failed to create payment link');
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      Alert.alert(
        'Error',
        'There was an error creating your payment link. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentLink = async () => {
    if (!paymentLink) return;

    try {
      const opened = await openPaymentLink(paymentLink.url);
      if (!opened) {
        Alert.alert('Error', 'Could not open the payment link. Please try again.');
      }
    } catch (error) {
      console.error('Error opening payment link:', error);
      Alert.alert('Error', 'Could not open the payment link. Please try again.');
    }
  };

  const handleCopyLink = () => {
    if (!paymentLink) return;

    Share.share({
      message: `Please complete your payment for the appointment with ${specialist.name} using this link: ${paymentLink.url}`,
      title: 'Payment Link'
    });
  };

  const handleCompletePayment = async () => {
    if (processingPayment) return;

    setProcessingPayment(true);
    try {
      // In a real app, we would verify the payment status with the backend
      // For now, we'll simulate a successful payment

      // Create a calendar event with Google Meet link
      const { meetLink: newMeetLink } = await addAppointmentToCalendar(
        specialist,
        startTime,
        endTime,
        title,
        description
      );

      // Show success message
      Alert.alert(
        'Payment Confirmed',
        'Your payment has been confirmed and your appointment has been scheduled.',
        [
          {
            text: 'View Details',
            onPress: () => {
              // Navigate to appointment confirmation screen
              navigation.navigate('AppointmentConfirmation', {
                specialist,
                startTime,
                endTime,
                duration,
                title,
                description,
                meetLink: newMeetLink,
                price: price.amount
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error completing payment:', error);
      Alert.alert('Error', 'There was an error confirming your payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Creating payment link...</Text>
          </View>
        ) : (
          <>
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
                      {formatDate(startTime)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={20} color="#4CAF50" />
                    <Text style={styles.detailText}>
                      {formatTime(startTime)} - {formatTime(endTime)}
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
                  <Text style={styles.priceValue}>{formatPrice(price.amount, price.currency)}</Text>
                </View>

                <View style={styles.rateContainer}>
                  <Text style={styles.rateText}>
                    Rate: {formatPrice(specialist.hourlyRate ?? (specialist.type === 'mental' ? 100 : 80), price.currency)} per hour
                  </Text>
                </View>
              </View>
            </View>

            {paymentLink && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Link</Text>
                <View style={styles.paymentLinkCard}>
                  <Text style={styles.paymentLinkInfo}>
                    Complete your payment by clicking the button below. The link will expire in 24 hours.
                  </Text>

                  <TouchableOpacity
                    style={styles.paymentLinkButton}
                    onPress={handleOpenPaymentLink}
                  >
                    <Ionicons name="card-outline" size={20} color="#fff" />
                    <Text style={styles.paymentLinkButtonText}>Open Payment Page</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.copyLinkButton}
                    onPress={handleCopyLink}
                  >
                    <Ionicons name="share-outline" size={20} color="#4CAF50" />
                    <Text style={styles.copyLinkText}>Share Payment Link</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.termsSection}>
              <Text style={styles.termsText}>
                By proceeding with payment, you agree to our Terms of Service and Cancellation Policy.
                Appointments can be cancelled up to 24 hours before the scheduled time for a full refund.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {!loading && paymentLink && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, processingPayment && styles.disabledButton]}
            onPress={handleCompletePayment}
            disabled={processingPayment}
          >
            {processingPayment ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.confirmButtonText}>I've Completed Payment</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.confirmButtonIcon} />
              </>
            )}
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    marginBottom: 8,
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
  rateContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  rateText: {
    fontSize: 14,
    color: '#666',
  },
  paymentLinkCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  paymentLinkInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  paymentLinkButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentLinkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  copyLinkButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  copyLinkText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
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
  confirmButton: {
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
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  confirmButtonIcon: {
    marginLeft: 8,
  },
});

export default PaymentLinkScreen;
