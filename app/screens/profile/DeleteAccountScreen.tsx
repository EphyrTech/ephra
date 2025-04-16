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
import { deleteUserAccount } from '../../services/firebase/userService';

interface DeleteAccountScreenProps {
  navigation: any;
}

const DeleteAccountScreen = ({ navigation }: DeleteAccountScreenProps) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!password) {
      newErrors.password = 'Password is required to verify your identity';
    }
    
    if (confirmText !== 'DELETE') {
      newErrors.confirmText = 'Please type DELETE to confirm';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteAccount = async () => {
    if (!validateForm()) {
      return;
    }
    
    Alert.alert(
      'Confirm Account Deletion',
      'This action cannot be undone. All your data will be permanently deleted. Are you sure you want to proceed?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: confirmDeleteAccount
        }
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await deleteUserAccount(password);
      // The auth state change will automatically redirect to login screen
      Alert.alert(
        'Account Deleted',
        'Your account has been successfully deleted.'
      );
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/wrong-password') {
        setErrors({
          ...errors,
          password: 'Incorrect password. Please try again.'
        });
      } else {
        Alert.alert(
          'Error',
          'Failed to delete account. Please try again later.'
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
          <Text style={styles.title}>Delete Account</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={40} color="#FF5252" style={styles.warningIcon} />
            <Text style={styles.warningTitle}>Warning: This action is permanent</Text>
            <Text style={styles.warningText}>
              Deleting your account will:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Remove all your personal information</Text>
              <Text style={styles.bulletPoint}>• Delete all your journal entries</Text>
              <Text style={styles.bulletPoint}>• Cancel all scheduled appointments</Text>
              <Text style={styles.bulletPoint}>• Remove your profile from our system</Text>
            </View>
            <Text style={styles.warningText}>
              This action cannot be undone. Please be certain.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter your password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Type "DELETE" to confirm</Text>
            <TextInput
              style={[styles.input, errors.confirmText && styles.inputError]}
              value={confirmText}
              onChangeText={(text) => {
                setConfirmText(text);
                if (errors.confirmText) {
                  setErrors({ ...errors, confirmText: '' });
                }
              }}
              placeholder="Type DELETE"
              placeholderTextColor="#999"
            />
            {errors.confirmText ? (
              <Text style={styles.errorText}>{errors.confirmText}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.deleteButton, loading && styles.disabledButton]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.deleteButtonText}>Delete My Account</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
  warningContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  warningIcon: {
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF5252',
    marginBottom: 12,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  bulletPoints: {
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
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
  deleteButton: {
    backgroundColor: '#FF5252',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ffcdd2',
  },
  buttonIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default DeleteAccountScreen;
