import {
  getNotificationPermissionStatus,
  openSystemNotificationSettings,
  requestNotificationPermission,
} from "@/api/nofiticationPermission";
import { AppNotificationStatuses, StorageKeys } from "@/constants/global";
import { AppNotificationStatus } from "@/interfaces/global";
import { useNotificationStore } from "@/store/notificationStore";
import { getCachedNotificationFilters, setCachedNotificationFilters } from "@/utils/offlineHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export function useNotificationSettings() {
  const [osStatus, setOsStatus] = useState<AppNotificationStatus>("undetermined");
  const [appEnabled, setAppEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { setFilters } = useNotificationStore();

  useEffect(() => {
    (async () => {
      try {
        const status = await getNotificationPermissionStatus();
        setOsStatus(status);

        const stored = await AsyncStorage.getItem(StorageKeys.APP_NOTIFICATIONS_ENABLED);
        if (stored !== null) {
          setAppEnabled(stored === "true");
        } else {
          setAppEnabled(status === AppNotificationStatuses.GRANTED);
        }
      } finally {
        const filters = await getCachedNotificationFilters();
        setFilters(filters);
        setLoading(false);
      }
    })();
  }, []);

  const toggleAppEnabled = useCallback(async (value: boolean) => {
    setAppEnabled(value);
    await AsyncStorage.setItem(StorageKeys.APP_NOTIFICATIONS_ENABLED, String(value));
  }, []);

  const askPermission = useCallback(async () => {
    const status = await requestNotificationPermission();
    setOsStatus(status);
    const enabled = status === AppNotificationStatuses.GRANTED;
    setAppEnabled(enabled);
    await AsyncStorage.setItem(StorageKeys.APP_NOTIFICATIONS_ENABLED, String(enabled));
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
    setOsStatus,
  };
}
