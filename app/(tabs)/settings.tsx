import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  AppNotificationStatuses,
  MOBILE_KEYWORDS_FILTERS,
} from "@/constants/global";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useNotificationStore } from "@/store/notificationStore";
import CheckBox from "@react-native-community/checkbox";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Switch } from "react-native";

export default function SettingsScreen() {
  const {
    loading,
    osStatus,
    appEnabled,
    setAppEnabled,
    askPermission,
    openSystemSettings,
    handleSetNotificationFilters,
  } = useNotificationSettings();

  const { filters } = useNotificationStore();

  const renderMobileFilters = useMemo(() => {
    return Object.values(MOBILE_KEYWORDS_FILTERS).map((keyword) => (
      <ThemedView style={styles.buttonContainer} key={keyword}>
        <ThemedText style={styles.text}>{keyword}</ThemedText>
        <CheckBox
          disabled={false}
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

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  return (
    <ThemedView style={{ padding: 16, gap: 16 }}>
      <ThemedText style={styles.subtitle}>Permission</ThemedText>
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
        <ThemedText style={styles.subtitle}>
          Notifications Preferences
        </ThemedText>
        {renderMobileFilters}
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
    fontSize: 20,
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
