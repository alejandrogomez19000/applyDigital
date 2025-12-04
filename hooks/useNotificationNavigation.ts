import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";

export function useNotificationNavigation() {
  const router = useRouter();

  const handleNotificationNavigation = useCallback(
    (response: Notifications.NotificationResponse | null) => {
      if (!response) return;

      const data: any = response.notification.request.content.data;
      if (!data) return;

      const { url } = data;

      if (url) {
        router.push({
          pathname: "/articleModal",
          params: { url },
        });
      }
    },
    [router]
  );

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationNavigation(response);
    });

    return () => {
      subscription.remove();
    };
  }, [handleNotificationNavigation]);
}
