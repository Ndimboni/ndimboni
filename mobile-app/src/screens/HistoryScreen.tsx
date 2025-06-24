import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DetectionHistory, StackNavigationProp } from "../types";

type HistoryScreenNavigationProp = StackNavigationProp<"History">;

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [history, setHistory] = useState<DetectionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem("detection_history");
      if (storedHistory) {
        const parsedHistory: DetectionHistory[] = JSON.parse(storedHistory);
        // Sort by timestamp descending (newest first)
        const sortedHistory = parsedHistory.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setHistory(sortedHistory);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      Alert.alert("Error", "Failed to load detection history");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const clearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all detection history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("detection_history");
              setHistory([]);
              Alert.alert("Success", "Detection history cleared");
            } catch (error) {
              console.error("Error clearing history:", error);
              Alert.alert("Error", "Failed to clear history");
            }
          },
        },
      ]
    );
  };

  // Load history when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      const days = Math.floor(diffDays);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "call":
        return "#FF6B6B";
      case "sms":
        return "#4ECDC4";
      case "manual":
        return "#45B7D1";
      default:
        return "#95A5A6";
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case "call":
        return "📞";
      case "sms":
        return "💬";
      case "manual":
        return "🔍";
      default:
        return "❓";
    }
  };

  const renderHistoryItem = ({ item }: { item: DetectionHistory }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
          <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
            {item.type.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>

      <View style={styles.phoneContainer}>
        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.isScammer ? "#FF6B6B" : "#2ECC71" },
          ]}
        >
          <Text style={styles.statusText}>
            {item.isScammer ? "SCAMMER" : "SAFE"}
          </Text>
        </View>
      </View>

      {item.isScammer && item.details && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Scam Details:</Text>
          <Text style={styles.detailsText} numberOfLines={2}>
            {item.details}
          </Text>
        </View>
      )}

      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.messageText} numberOfLines={3}>
            {item.message}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Detection History</Text>
      <Text style={styles.emptyText}>
        When you receive calls or SMS messages, they'll appear here if they
        match known scammers.
      </Text>
      <TouchableOpacity
        style={styles.checkButton}
        onPress={() => navigation.navigate("Check")}
      >
        <Text style={styles.checkButtonText}>Check a Number Manually</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Detection History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{history.length}</Text>
          <Text style={styles.statLabel}>Total Checks</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#FF6B6B" }]}>
            {history.filter((item) => item.isScammer).length}
          </Text>
          <Text style={styles.statLabel}>Scammers Detected</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#2ECC71" }]}>
            {history.filter((item) => !item.isScammer).length}
          </Text>
          <Text style={styles.statLabel}>Safe Numbers</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => `${item.phoneNumber}-${item.timestamp}`}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={
            history.length === 0 ? styles.emptyContainer : undefined
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E74C3C",
    borderRadius: 20,
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    textAlign: "center",
  },
  historyItem: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  phoneContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#FFF5F5",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E74C3C",
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
  },
  messageContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7F8C8D",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#7F8C8D",
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  checkButton: {
    backgroundColor: "#3498DB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  checkButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HistoryScreen;
