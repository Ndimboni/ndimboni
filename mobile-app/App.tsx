import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, Alert, AppState, AppStateStatus } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from "expo-notifications";
import "react-native-gesture-handler";

// Import screens
import HomeScreen from "./src/screens/HomeScreen";
import ReportScreen from "./src/screens/ReportScreen";
import CheckScreen from "./src/screens/CheckScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

// Import services
import ScamDetectionService from "./src/services/ScamDetectionService";
import CallSMSMonitorService from "./src/services/CallSMSMonitorService";

// Import types
import { RootStackParamList } from "./src/types";

const Stack = createStackNavigator<RootStackParamList>();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();

    // Handle app state changes for background/foreground monitoring
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // App is in foreground
        console.log("App became active");
      } else if (nextAppState === "background") {
        // App is in background
        console.log("App went to background");
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  const initializeApp = async () => {
    try {
      console.log("Initializing Ndimboni Scam Guard...");

      // Request notification permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Notification Permission Required",
          "This app needs notification permissions to alert you about potential scam calls and messages.",
          [{ text: "OK" }]
        );
      }

      // Initialize services
      await ScamDetectionService.init();
      // Note: CallSMSMonitorService doesn't have an init method, it's ready to use

      // Set up notification response handler
      const responseSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("Notification response received:", response);
          // Handle notification tap actions here if needed
        });

      console.log("App initialization complete");
      setIsInitialized(true);

      return () => {
        responseSubscription.remove();
      };
    } catch (error) {
      console.error("Error initializing app:", error);
      Alert.alert(
        "Initialization Error",
        "There was an error starting the app. Some features may not work correctly.",
        [{ text: "OK" }]
      );
      setIsInitialized(true); // Allow app to continue even with errors
    }
  };

  if (!isInitialized) {
    // Could show a splash screen here
    return null;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#F8F9FA" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
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
            headerTintColor: "#2C3E50",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 18,
            },
            cardStyle: { backgroundColor: "#F8F9FA" },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: "Ndimboni Scam Guard",
              headerTitleAlign: "center",
            }}
          />
          <Stack.Screen
            name="Report"
            component={ReportScreen}
            options={{
              title: "Report Scammer",
              headerTitleAlign: "center",
            }}
          />
          <Stack.Screen
            name="Check"
            component={CheckScreen}
            options={{
              title: "Check Number",
              headerTitleAlign: "center",
            }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: "Detection History",
              headerTitleAlign: "center",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
