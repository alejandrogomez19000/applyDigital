import {
  getNotificationPermissionStatus,
  openSystemNotificationSettings,
  requestNotificationPermission,
} from "@/api/nofiticationPermission";
import { AppNotificationStatus } from "@/interfaces/global";
import { getCachedNotificationFilters, setCachedNotificationFilters } from "@/utils/offlineHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "app_notifications_enabled";

export function useNotificationSettings() {
  const [osStatus, setOsStatus] = useState<AppNotificationStatus>("undetermined");
  const [appEnabled, setAppEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [notificationFilters, setNotificationFilters] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const status = await getNotificationPermissionStatus();

        setOsStatus(status);
        setAppEnabled(status === "granted");
      } finally {
        const filters = await getCachedNotificationFilters();
        setNotificationFilters(filters);
        setLoading(false);
      }
    })();
  }, []);

  const toggleAppEnabled = useCallback(async (value: boolean) => {
    setAppEnabled(value);
    await AsyncStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  const askPermission = useCallback(async () => {
    const status = await requestNotificationPermission();
    console.log(status, "status after requesting permission");
    setOsStatus(status);
    return status;
  }, []);

  const handleSetNotificationFilters = (filters: string[]) => {
    setCachedNotificationFilters(filters);
    setNotificationFilters(filters);
  };

  return {
    loading,
    osStatus,
    appEnabled,
    setAppEnabled: toggleAppEnabled,
    askPermission,
    openSystemSettings: openSystemNotificationSettings,
    handleSetNotificationFilters,
    notificationFilters,
  };
}
