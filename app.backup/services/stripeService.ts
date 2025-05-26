import { Alert, Linking } from 'react-native';
import Constants from 'expo-constants';

// Get environment variables from Expo Constants
const expoConstants = Constants.expoConfig?.extra || {};

// Get Stripe publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = expoConstants.STRIPE_PUBLISHABLE_KEY;

// Replace with your backend API URL - this would be your serverless function or backend API
const API_URL = expoConstants.API_URL ?? 'https://your-backend-api.com';

// Initialize Stripe (mock implementation)
export const initializeStripe = async () => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Stripe initialized successfully (mock)');
    return true;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    return false;
  }
};

// Interface for coach rate information
export interface CoachRate {
  hourlyRate: number;
  currency: string;
}

// Interface for customer information
export interface CustomerInfo {
  id: string;
  email: string;
  name?: string;
}

// Interface for payment link information
export interface PaymentLinkInfo {
  id: string;
  url: string;
  amount: number;
  currency: string;
  expiresAt?: number;
}

// Mock function to create a Stripe customer
export const createMockCustomer = async (email: string, name?: string): Promise<CustomerInfo> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Generate a random customer ID
  const customerId = `cus_mock_${Math.random().toString(36).substring(2)}`;

  console.log('Created mock customer:', {
    id: customerId,
    email,
    name
  });

  return {
    id: customerId,
    email,
    name
  };
};

// Mock function to create a payment link
export const createMockPaymentLink = async (
  amount: number,
  currency: string,
  customerId: string,
  appointmentDetails: any
): Promise<PaymentLinkInfo> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate a random payment link ID and URL
  const paymentLinkId = `plink_mock_${Math.random().toString(36).substring(2)}`;
  // Use a real URL that can be opened in the browser
  const paymentLinkUrl = `https://stripe.com`;

  // Set expiration to 24 hours from now
  const expiresAt = Math.floor(Date.now() / 1000) + 86400; // 24 hours

  console.log('Created mock payment link:', {
    id: paymentLinkId,
    url: paymentLinkUrl,
    amount,
    currency,
    customerId,
    appointmentDetails,
    expiresAt
  });

  return {
    id: paymentLinkId,
    url: paymentLinkUrl,
    amount,
    currency,
    expiresAt
  };
};

// Create or retrieve a Stripe customer
export const getOrCreateCustomer = async (userId: string, email: string, name?: string): Promise<CustomerInfo> => {
  try {
    // In a real implementation, we would check if the customer already exists in a database
    // and create a new one if needed using the Stripe API

    // For now, use the mock implementation
    return await createMockCustomer(email, name);
  } catch (error) {
    console.error('Error creating/retrieving customer:', error);
    throw error;
  }
};

// Create a payment link for an appointment
export const createPaymentLink = async (
  amount: number,
  currency: string,
  customerId: string,
  appointmentDetails: any
): Promise<PaymentLinkInfo> => {
  try {
    // For now, use the mock implementation
    return await createMockPaymentLink(amount, currency, customerId, appointmentDetails);
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw error;
  }
};

// Process a payment for an appointment using a payment link
export const processAppointmentPaymentWithLink = async (
  userId: string,
  email: string,
  name: string,
  amount: number,
  currency: string,
  appointmentDetails: any
) => {
  try {
    // Get or create customer
    const customer = await getOrCreateCustomer(userId, email, name);

    // Create payment link
    const paymentLink = await createPaymentLink(
      amount,
      currency,
      customer.id,
      appointmentDetails
    );

    // Return the payment link information
    return {
      success: true,
      paymentLink,
      customer
    };
  } catch (error) {
    console.error('Error processing appointment payment:', error);
    Alert.alert('Payment Error', 'There was an error creating your payment link. Please try again.');
    return { success: false };
  }
};

// Get coach rate from specialist data or use default
export const getCoachRate = (specialist: any): CoachRate => {
  // If the specialist has a defined rate, use it
  if (specialist.hourlyRate && specialist.currency) {
    return {
      hourlyRate: specialist.hourlyRate,
      currency: specialist.currency.toLowerCase()
    };
  }

  // Otherwise use default rates based on specialist type
  const defaultRates = {
    mental: 100, // $100 per hour for mental health specialists
    physical: 80, // $80 per hour for physical health specialists
  };

  return {
    hourlyRate: defaultRates[specialist.type] ?? 90, // Default to $90 if type is unknown
    currency: 'usd'
  };
};

// Calculate appointment price based on coach rate and duration
export const calculateAppointmentPrice = (
  specialist: any,
  durationMinutes: number
): { amount: number; currency: string } => {
  // Get the coach's rate
  const { hourlyRate, currency } = getCoachRate(specialist);

  // Calculate price based on duration (in minutes)
  const amount = Math.round((hourlyRate * durationMinutes) / 60);

  return { amount, currency };
};

// Format price for display
export const formatPrice = (amount: number, currency: string = 'usd'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });

  return formatter.format(amount);
};

// Open payment link in browser
export const openPaymentLink = async (url: string): Promise<boolean> => {
  try {
    console.log('Opening payment link:', url);

    // For testing purposes, show an alert with the URL
    Alert.alert(
      'Payment Link',
      `Opening payment link: ${url}`,
      [
        {
          text: 'Open',
          onPress: () => {
            Linking.openURL(url).catch(err => {
              console.error('Error in openURL:', err);
              Alert.alert('Error', 'Could not open the payment link.');
            });
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );

    return true;
  } catch (error) {
    console.error('Error opening URL:', error);
    Alert.alert('Error', 'Could not open the payment link. Please try again.');
    return false;
  }
};
