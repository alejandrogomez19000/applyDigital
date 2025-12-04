import { getNotificationPermissionStatus } from "@/api/nofiticationPermission";
import { Header } from "@/components/Header";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppNotificationStatuses, MOBILE_KEYWORDS_FILTERS, StorageKeys } from "@/constants/global";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useNotificationStore } from "@/store/notificationStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, AppState, AppStateStatus, StyleSheet, Switch } from "react-native";

export default function SettingsScreen() {
  const {
    loading,
    osStatus,
    appEnabled,
    setAppEnabled,
    askPermission,
    openSystemSettings,
    handleSetNotificationFilters,
    setOsStatus,
  } = useNotificationSettings();

  const { filters } = useNotificationStore();

  const renderMobileFilters = useMemo(() => {
    return Object.values(MOBILE_KEYWORDS_FILTERS).map((keyword) => (
      <ThemedView style={styles.buttonContainer} key={keyword}>
        <ThemedText style={styles.text}>{keyword}</ThemedText>
        <Switch
          value={filters.some((el) => el === keyword)}
          onValueChange={(newValue) => {
            const newFilters = newValue
              ? [...filters, keyword]
              : filters.filter((el) => el !== keyword);
            handleSetNotificationFilters(newFilters);
          }}
        />
      </ThemedView>
    ));
  }, [handleSetNotificationFilters, filters]);

  const osGranted = osStatus === AppNotificationStatuses.GRANTED;

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        (async () => {
          const status = await getNotificationPermissionStatus();
          setOsStatus(status);

          if (status !== AppNotificationStatuses.GRANTED) {
            setAppEnabled(false);
            await AsyncStorage.setItem(StorageKeys.APP_NOTIFICATIONS_ENABLED, "false");
          } else {
            setAppEnabled(true);
          }
        })();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [setAppEnabled, setOsStatus]);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Header title="Settings" />
      <ThemedView style={{ padding: 16 }}>
        <ThemedView style={styles.buttonContainer}>
          <ThemedText>Enable notifications in this app</ThemedText>
          <Switch
            value={appEnabled}
            onValueChange={async (value) => {
              if (value && !osGranted) {
                const status = await askPermission();
                if (status !== AppNotificationStatuses.GRANTED) {
                  openSystemSettings();
                  return;
                }
              } else {
                openSystemSettings();
              }
              await setAppEnabled(value);
            }}
          />
        </ThemedView>
        <ThemedView>
          <ThemedText style={styles.subtitle}>Notifications Preferences</ThemedText>
          {renderMobileFilters}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 50,
  },
  subtitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "bold",
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#81b0ff",
  },
  text: {
    fontSize: 16,
  },
});
