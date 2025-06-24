import React, { useState } from "react";
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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { StackNavigationProp } from "@react-navigation/stack";
import NdimboniAPI from "../services/api";
import { RootStackParamList, ReportScammerRequest } from "../types";
import { APP_CONSTANTS } from "../utils/config";

type ReportScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Report"
>;

interface Props {
  navigation: ReportScreenNavigationProp;
}

export default function ReportScreen({ navigation }: Props) {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    try {
      // Validation
      if (!phoneNumber.trim()) {
        Alert.alert("Error", "Please enter a phone number");
        return;
      }

      if (!NdimboniAPI.validatePhoneNumber(phoneNumber)) {
        Alert.alert("Error", "Please enter a valid phone number");
        return;
      }

      if (!description.trim()) {
        Alert.alert("Error", "Please provide a description of the scam");
        return;
      }

      if (description.trim().length < 10) {
        Alert.alert("Error", "Description must be at least 10 characters");
        return;
      }

      setIsSubmitting(true);

      const reportData: ReportScammerRequest = {
        phoneNumber: phoneNumber.trim(),
        description: description.trim(),
        additionalInfo: additionalInfo.trim(),
      };

      const result = await NdimboniAPI.reportScammerPhone(reportData);

      if (result.success) {
        Alert.alert(
          "Report Submitted",
          APP_CONSTANTS.SUCCESS_MESSAGES.REPORT_SUBMITTED,
          [
            {
              text: "OK",
              onPress: () => {
                // Clear form
                setPhoneNumber("");
                setDescription("");
                setAdditionalInfo("");
                // Navigate back to home
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        throw new Error(result.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert(
        "Submission Failed",
        error instanceof Error
          ? error.message
          : APP_CONSTANTS.ERROR_MESSAGES.REPORT_FAILED,
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (text: string): string => {
    // Remove all non-digit characters except +
    let cleaned = text.replace(/[^\d+]/g, "");

    // Auto-format for Rwanda numbers
    if (cleaned.startsWith("0")) {
      cleaned = "+250" + cleaned.substring(1);
    }

    return cleaned;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Report a Scammer</Text>
          <Text style={styles.subtitle}>
            Help protect others by reporting scam phone numbers
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scammer Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
              placeholder="e.g. +250788123456"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.inputHint}>
              Enter the complete phone number including country code
            </Text>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description of Scam *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what happened. How did they try to scam you?"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.inputHint}>
              {description.length}/1000 characters (minimum 10)
            </Text>
          </View>

          {/* Additional Information Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Information</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              placeholder="Any additional details that might help (optional)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.inputHint}>
              {additionalInfo.length}/500 characters (optional)
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why Report?</Text>
            <Text style={styles.infoText}>
              • Helps protect other users from the same scammer{"\n"}•
              Contributes to our scammer database{"\n"}• Enables
              community-driven protection{"\n"}• Reports are reviewed by our
              team
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#2196F3",
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#E3F2FD",
    textAlign: "center",
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    padding: 16,
    marginBottom: 20,
    borderRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1976D2",
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: "#B0BEC5",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#666",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
