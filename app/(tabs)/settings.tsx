import { AppNotificationStatuses, MOBILE_KEYWORDS_FILTERS } from "@/constants/global";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import CheckBox from "@react-native-community/checkbox";
import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, View } from "react-native";

export default function SettingsScreen() {
  const {
    loading,
    osStatus,
    appEnabled,
    setAppEnabled,
    askPermission,
    openSystemSettings,
    notificationFilters,
    handleSetNotificationFilters,
  } = useNotificationSettings();

  const renderMobileFilters = useMemo(() => {
    return Object.values(MOBILE_KEYWORDS_FILTERS).map((keyword) => (
      <View style={styles.buttonContainer} key={keyword}>
        <Text style={styles.text}>{keyword}</Text>
        <CheckBox
          disabled={false}
          value={notificationFilters.some((el) => el === keyword)}
          onValueChange={(newValue) => {
            const newFilters = newValue
              ? [...notificationFilters, keyword]
              : notificationFilters.filter((el) => el !== keyword);
            handleSetNotificationFilters(newFilters);
          }}
        />
      </View>
    ));
  }, [handleSetNotificationFilters, notificationFilters]);
  console.log(notificationFilters, "notification filters all time");
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
    <View style={{ padding: 16, gap: 16 }}>
      <Text style={styles.subtitle}>Permission</Text>
      <View style={styles.buttonContainer}>
        <Text>Enable notifications in this app</Text>
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
      </View>
      <View>
        <Text style={styles.subtitle}>Notifications Preferences</Text>
        {renderMobileFilters}
      </View>
    </View>
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
