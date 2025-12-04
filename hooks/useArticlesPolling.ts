import axios from "@/api/axios";
import { showNewArticleNotification } from "@/api/notifications";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useCallback, useEffect, useRef } from "react";
import { useNotificationSettings } from "./useNotificationSettings";

const POLL_INTERVAL_MS = 60000;

export const useArticlesPolling = () => {
  const latestCreatedAtRef = useRef<string | null>(null);
  const { appEnabled, askPermission } = useNotificationSettings();
  const { addNewArticle } = useArticleStore();
  const { filters } = useNotificationStore();

  const meetsFilters = useCallback(
    (article: IArticle) => {
      const text = `${article.title} ${article.story_url ?? ""}`.toLowerCase();
      return filters.some((key) => text.includes(key));
    },
    [filters]
  );

  useEffect(() => {
    if (!appEnabled) {
      askPermission();
      return;
    }

    const fetchAndCheck = async () => {
      try {
        const { data } = await axios.get(`/search_by_date?query=mobile&page=0`);

        if (!data) return;

        const hits: IArticle[] = data.hits ?? [];
        if (hits.length === 0) return;

        const newestTimestamp = hits[0].created_at;

        if (!latestCreatedAtRef.current) {
          latestCreatedAtRef.current = newestTimestamp;
          return;
        }

        const lastSeen = new Date(latestCreatedAtRef.current);
        const newArticles = hits
          .filter((a) => new Date(a.created_at) > lastSeen)
          .filter(meetsFilters);

        if (newArticles.length > 0) {
          latestCreatedAtRef.current = newestTimestamp;

          for (const article of newArticles) {
            await showNewArticleNotification({
              title:
                article.title || article.story_title || "New HN mobile article",
              url: article.story_url ?? undefined,
              body: `By ${article.author}`,
            });
          }
        }
      } catch (e) {
        console.warn("Error fetching HN articles", e);
      }
    };

    fetchAndCheck();

    const intervalId = setInterval(fetchAndCheck, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [addNewArticle, appEnabled, askPermission, meetsFilters]);
};
