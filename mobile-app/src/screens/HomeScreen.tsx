import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import ScamDetectionService from '../services/ScamDetectionService';
import CallSMSMonitorService from '../services/CallSMSMonitorService';
import NdimboniAPI from '../services/api';
import { RootStackParamList, MonitoringStats } from '../types';
import { APP_CONSTANTS } from '../utils/config';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [stats, setStats] = useState<MonitoringStats>({
    isMonitoring: false,
    totalCalls: 0,
    totalSMS: 0,
    detectionsToday: 0,
    lastUpdate: Date.now(),
  });
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async (): Promise<void> => {
    try {
      // Check API connectivity
      const connected = await NdimboniAPI.testConnection();
      setApiStatus(connected ? 'connected' : 'disconnected');

      // Get monitoring status
      const monitoringStatus = await CallSMSMonitorService.isMonitoringEnabled();
      setIsMonitoring(monitoringStatus);

      // Get statistics
      await loadStats();

      // Start monitoring if enabled
      if (monitoringStatus) {
        CallSMSMonitorService.startMonitoring();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setApiStatus('error');
    }
  };

  const loadStats = async (): Promise<void> => {
    try {
      const monitoringStats = await CallSMSMonitorService.getMonitoringStats();
      setStats(monitoringStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const toggleMonitoring = async (value: boolean): Promise<void> => {
    try {
      setIsMonitoring(value);
      await CallSMSMonitorService.setMonitoringEnabled(value);
      
      if (value) {
        const started = await CallSMSMonitorService.startMonitoring();
        if (!started) {
          Alert.alert(
            'Monitoring Failed',
            'Could not start monitoring. Please check permissions.',
            [{ text: 'OK' }]
          );
          setIsMonitoring(false);
        }
      } else {
        CallSMSMonitorService.stopMonitoring();
      }
      
      await loadStats();
    } catch (error) {
      console.error('Error toggling monitoring:', error);
      Alert.alert('Error', 'Failed to toggle monitoring');
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await initializeApp();
    setRefreshing(false);
  };

  const testScammerAlert = async (): Promise<void> => {
    try {
      Alert.alert(
        'Test Scammer Alert',
        'This will show a test scammer warning notification.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Test', 
            onPress: async () => {
              await ScamDetectionService.showScammerAlert(
                '+250788123456', 
                'test'
              );
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error testing alert:', error);
    }
  };

  const getStatusColor = (status: typeof apiStatus): string => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'disconnected': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: typeof apiStatus): string => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Error';
      default: return 'Checking...';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{APP_CONSTANTS.APP_NAME}</Text>
        <Text style={styles.subtitle}>Protecting you from digital scams</Text>
      </View>

      {/* API Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Backend API:</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(apiStatus) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(apiStatus) }]}>
            {getStatusText(apiStatus)}
          </Text>
        </View>
      </View>

      {/* Monitoring Toggle */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Real-time Protection</Text>
          <Switch
            value={isMonitoring}
            onValueChange={toggleMonitoring}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={isMonitoring ? '#fff' : '#fff'}
          />
        </View>
        <Text style={styles.cardDescription}>
          {isMonitoring 
            ? 'Monitoring incoming calls and SMS for known scammers'
            : 'Enable to protect against incoming scam calls and messages'
          }
        </Text>
      </View>

      {/* Statistics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Protection Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.detectionsToday}</Text>
            <Text style={styles.statLabel}>Scammers Blocked Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalCalls}</Text>
            <Text style={styles.statLabel}>Calls Monitored</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalSMS}</Text>
            <Text style={styles.statLabel}>SMS Monitored</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Report')}
          >
            <Text style={styles.actionButtonText}>Report Scammer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Check')}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Check Number
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Detection History */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardDescription}>
          Your scam protection activity will appear here
        </Text>
      </View>

      {/* Developer Tools (only in development) */}
      {__DEV__ && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Developer Tools</Text>
          <TouchableOpacity
            style={[styles.actionButton, styles.testButton]}
            onPress={testScammerAlert}
          >
            <Text style={styles.actionButtonText}>Test Scammer Alert</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  actionButtons: {
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  testButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
  linkText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
});
