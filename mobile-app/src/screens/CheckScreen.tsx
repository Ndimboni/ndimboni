import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import ScamDetectionService from '../services/ScamDetectionService';
import NdimboniAPI from '../services/api';
import { RootStackParamList, ScammerData } from '../types';

type CheckScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Check'>;

interface Props {
  navigation: CheckScreenNavigationProp;
}

interface CheckResult {
  success: boolean;
  isScammer?: boolean;
  data?: ScammerData;
  message?: string;
  error?: string;
}

export default function CheckScreen({ navigation }: Props) {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleCheck = async (): Promise<void> => {
    try {
      if (!phoneNumber.trim()) {
        Alert.alert('Error', 'Please enter a phone number');
        return;
      }

      if (!NdimboniAPI.validatePhoneNumber(phoneNumber)) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return;
      }

      setIsChecking(true);
      setResult(null);

      const checkResult = await ScamDetectionService.manualCheck(phoneNumber.trim());
      setResult(checkResult);

    } catch (error) {
      console.error('Error checking number:', error);
      Alert.alert(
        'Check Failed',
        'Failed to check the phone number. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsChecking(false);
    }
  };

  const formatPhoneNumber = (text: string): string => {
    let cleaned = text.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '+250' + cleaned.substring(1);
    }
    
    return cleaned;
  };

  const clearResult = (): void => {
    setResult(null);
    setPhoneNumber('');
  };

  const renderResult = (): React.ReactElement | null => {
    if (!result) return null;

    if (!result.success) {
      return (
        <View style={styles.resultCard}>
          <View style={[styles.resultHeader, styles.errorHeader]}>
            <Text style={styles.resultIcon}>❌</Text>
            <Text style={styles.resultTitle}>Check Failed</Text>
          </View>
          <Text style={styles.resultMessage}>
            {result.error || 'Unable to check this number'}
          </Text>
        </View>
      );
    }

    if (result.isScammer) {
      return (
        <View style={styles.resultCard}>
          <View style={[styles.resultHeader, styles.dangerHeader]}>
            <Text style={styles.resultIcon}>🚨</Text>
            <Text style={styles.resultTitle}>SCAMMER DETECTED!</Text>
          </View>
          <Text style={styles.resultMessage}>
            This number has been reported as a scammer.
          </Text>
          {result.data && (
            <View style={styles.resultDetails}>
              <Text style={styles.detailsTitle}>Report Details:</Text>
              <Text style={styles.detailsText}>
                Type: {result.data.type || 'Unknown'}
              </Text>
              {result.data.description && (
                <Text style={styles.detailsText}>
                  Description: {result.data.description}
                </Text>
              )}
              {result.data.status && (
                <Text style={styles.detailsText}>
                  Status: {result.data.status}
                </Text>
              )}
            </View>
          )}
          <View style={styles.resultActions}>
            <Text style={styles.warningText}>
              ⚠️ Do not answer calls or reply to messages from this number
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.resultCard}>
        <View style={[styles.resultHeader, styles.safeHeader]}>
          <Text style={styles.resultIcon}>✅</Text>
          <Text style={styles.resultTitle}>Number appears safe</Text>
        </View>
        <Text style={styles.resultMessage}>
          This number is not currently in our scammer database.
        </Text>
        <View style={styles.resultActions}>
          <Text style={styles.infoText}>
            💡 If you believe this number is a scammer, you can report it to help protect others.
          </Text>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => navigation.navigate('Report')}
          >
            <Text style={styles.reportButtonText}>Report as Scammer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Check Phone Number</Text>
          <Text style={styles.subtitle}>
            Check if a phone number is a known scammer
          </Text>
        </View>

        {/* Check Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
              placeholder="e.g. +250788123456"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isChecking}
            />
            <Text style={styles.inputHint}>
              Enter the complete phone number including country code
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkButton,
              isChecking && styles.checkButtonDisabled,
            ]}
            onPress={handleCheck}
            disabled={isChecking}
          >
            {isChecking ? (
              <View style={styles.checkingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.checkButtonText}>Checking...</Text>
              </View>
            ) : (
              <Text style={styles.checkButtonText}>Check Number</Text>
            )}
          </TouchableOpacity>

          {result && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearResult}
            >
              <Text style={styles.clearButtonText}>Check Another Number</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Result */}
        {renderResult()}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>How it works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoItemIcon}>🔍</Text>
            <Text style={styles.infoItemText}>
              We check the number against our database of reported scammers
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoItemIcon}>🛡️</Text>
            <Text style={styles.infoItemText}>
              Our database is continuously updated with community reports
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoItemIcon}>🤝</Text>
            <Text style={styles.infoItemText}>
              Help others by reporting scammers you encounter
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  checkButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  checkButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerHeader: {
    backgroundColor: '#FFEBEE',
  },
  safeHeader: {
    backgroundColor: '#E8F5E8',
  },
  errorHeader: {
    backgroundColor: '#FFF3E0',
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultMessage: {
    padding: 16,
    paddingTop: 0,
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  resultDetails: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#F5F5F5',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultActions: {
    padding: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  reportButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    margin: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoItemIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  infoItemText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
