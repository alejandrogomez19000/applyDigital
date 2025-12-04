import { AppNotificationStatus } from "@/interfaces/global";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";

export async function getNotificationPermissionStatus(): Promise<AppNotificationStatus> {
  const { status } = await Notifications.getPermissionsAsync();

  return status as AppNotificationStatus;
}

export async function requestNotificationPermission(): Promise<AppNotificationStatus> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") {
    return "granted";
  }

  if (existingStatus === "undetermined") {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return status;
  }

  Alert.alert(
    "Notifications disabled",
    "To enable notifications, you need to turn them on in your device settings.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open settings",
        onPress: () => {
          openSystemNotificationSettings();
        },
      },
    ]
  );

  return "denied";
}

export async function openSystemNotificationSettings() {
  try {
    await Linking.openSettings();
  } catch (e) {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    }
  }
}
