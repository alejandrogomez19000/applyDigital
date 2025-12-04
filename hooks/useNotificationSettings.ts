import {
  getNotificationPermissionStatus,
  openSystemNotificationSettings,
  requestNotificationPermission,
} from "@/api/nofiticationPermission";
import { AppNotificationStatus } from "@/interfaces/global";
import { useNotificationStore } from "@/store/notificationStore";
import {
  getCachedNotificationFilters,
  setCachedNotificationFilters,
} from "@/utils/offlineHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "app_notifications_enabled";

export function useNotificationSettings() {
  const [osStatus, setOsStatus] =
    useState<AppNotificationStatus>("undetermined");
  const [appEnabled, setAppEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const { setFilters } = useNotificationStore();

  useEffect(() => {
    (async () => {
      try {
        const status = await getNotificationPermissionStatus();

        setOsStatus(status);
        setAppEnabled(status === "granted");
      } finally {
        const filters = await getCachedNotificationFilters();
        setFilters(filters);
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
    setOsStatus(status);
    return status;
  }, []);

  const handleSetNotificationFilters = (filters: string[]) => {
    setCachedNotificationFilters(filters);
    setFilters(filters);
  };

  return {
    loading,
    osStatus,
    appEnabled,
    setAppEnabled: toggleAppEnabled,
    askPermission,
    openSystemSettings: openSystemNotificationSettings,
    handleSetNotificationFilters,
  };
}
