import axios from "@/api/axios";
import { StorageKeys } from "@/constants/global";
import { IArticle } from "@/interfaces/global";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundTask from "expo-background-task";
import type { NotificationBehavior } from "expo-notifications";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<NotificationBehavior> => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function showNewArticleNotification({
  title,
  url,
  body,
}: {
  title: string;
  url?: string;
  body: string;
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { url },
    },
    trigger: null,
  });
}

TaskManager.defineTask(StorageKeys.HN_BACKGROUND_TASK, async () => {
  try {
    const { data } = await axios.get(`/search_by_date?query=mobile&page=0`);
    console.log("HN background task: before", data);

    if (!data) {
      console.log("HN background task: fetch failed", data);
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    const hits: IArticle[] = data.hits ?? [];
    if (hits.length === 0) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const newestTimestamp = hits[0].created_at;
    const stored = await AsyncStorage.getItem(StorageKeys.LAST_SEEN_KEY);

    if (!stored) {
      await AsyncStorage.setItem(StorageKeys.LAST_SEEN_KEY, newestTimestamp);
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const lastSeen = new Date(stored);
    const newArticles = hits.filter((a) => new Date(a.created_at) > lastSeen);

    if (newArticles.length === 0) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    await AsyncStorage.setItem(StorageKeys.LAST_SEEN_KEY, newestTimestamp);

    const first = newArticles[0];
    await showNewArticleNotification({
      title: first.title || first.story_title || "New HN mobile article",
      url: first.story_url ?? undefined,
      body: `By ${first.author}`,
    });

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (e) {
    console.warn("HN background task error", e);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerHnBackgroundTask() {
  const status = await BackgroundTask.getStatusAsync();
  console.log(status, "BackgroundTask status");
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) {
    console.log("BackgroundTask not available, status:", status);
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(StorageKeys.HN_BACKGROUND_TASK);
  console.log(isRegistered, "BackgroundTask isRegistered");

  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(StorageKeys.HN_BACKGROUND_TASK, {
      minimumInterval: 15,
    });
    console.log("HN background task registered");
  }
}

export async function unregisterHnBackgroundTask() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(StorageKeys.HN_BACKGROUND_TASK);
  if (isRegistered) {
    await BackgroundTask.unregisterTaskAsync(StorageKeys.HN_BACKGROUND_TASK);
    console.log("HN background task unregistered");
  }
}
