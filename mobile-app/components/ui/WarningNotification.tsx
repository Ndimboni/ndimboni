import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function showWarningNotification(message: string) {
  // This should trigger a UI update, e.g. via context or state
  // For now, just log
  console.warn(message);
}

export const WarningNotification = ({ message }: { message: string }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
  backgroundColor: '#FFE08A',
  padding: 12,
  borderRadius: 8,
  marginHorizontal: 12,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: '#D4AF37',
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  },
  text: {
    color: '#333',
    fontWeight: 'bold',
  fontSize: 14,
  },
});
