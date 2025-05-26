import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/api';

interface ChangeEmailScreenProps {
  navigation: any;
}

const ChangeEmailScreen = ({ navigation }: ChangeEmailScreenProps) => {
  const { user } = useAuth();
  const [currentEmail, setCurrentEmail] = useState(user?.email || '');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newEmail) {
      newErrors.newEmail = 'New email is required';
    } else if (!emailRegex.test(newEmail)) {
      newErrors.newEmail = 'Please enter a valid email address';
    }

    if (newEmail === currentEmail) {
      newErrors.newEmail = 'New email must be different from current email';
    }

    if (!password) {
      newErrors.password = 'Password is required to verify your identity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateEmail = async () => {
    console.log('Update email button clicked');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Updating email from', currentEmail, 'to', newEmail);
    setLoading(true);
    try {
      // Update user email with password verification
      const result = await userService.updateUserEmail(newEmail, password);
      console.log('Email update successful:', result);

      // Show success message and navigate back
      Alert.alert(
        'Success',
        'Your email has been updated successfully. Please sign in with your new email next time.',
        [{
          text: 'OK',
          onPress: () => {
            console.log('Navigating back to profile screen');
            // Navigate back to profile screen
            navigation.goBack();
          }
        }]
      );
    } catch (error: any) {
      console.error('Error updating email:', error);

      // Handle API errors
      if (error.status === 400 || error.response?.status === 400) {
        const errorMessage = error.response?.data?.detail || error.message;
        if (errorMessage.includes('already in use')) {
          setErrors({
            ...errors,
            newEmail: 'This email is already in use by another account.'
          });
        } else {
          setErrors({
            ...errors,
            newEmail: errorMessage || 'Invalid email address.'
          });
        }
      } else if (error.status === 401 || error.response?.status === 401) {
        setErrors({
          ...errors,
          password: 'Incorrect password. Please try again.'
        });
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.detail || error.message || 'Failed to update email. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Change Email</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.description}>
            Enter your new email address and current password to update your account.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Email</Text>
            <TextInput
              style={styles.input}
              value={currentEmail}
              editable={false}
              placeholder="Your current email"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Email</Text>
            <TextInput
              style={[styles.input, errors.newEmail && styles.inputError]}
              value={newEmail}
              onChangeText={(text) => {
                setNewEmail(text);
                if (errors.newEmail) {
                  setErrors({ ...errors, newEmail: '' });
                }
              }}
              placeholder="Enter new email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {errors.newEmail ? (
              <Text style={styles.errorText}>{errors.newEmail}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              placeholder="Enter your current password"
              placeholderTextColor="#999"
              secureTextEntry
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.disabledButton]}
            onPress={handleUpdateEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update Email</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.noteText}>
            Note: You will need to sign in with your new email address after this change.
          </Text>
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
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
  },
});

export default ChangeEmailScreen;
