import axios from "@/api/axios";
import { IArticle, StorageKeys } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import {
  addCachedDeletedId,
  addCachedFavouriteId,
  updateCachedArticles,
} from "@/utils/offlineHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect } from "react";

const useGetArticles = ({ page = 0 }: { page?: number }) => {
  const {
    articles,
    setArticles,
    setDeletedArticle,
    deleteArticle,
    setFavouriteArticle,
    favouriteArticles,
    setDeletedArticles,
    setFavouriteArticles,
    deletedArticles,
  } = useArticleStore();

  const handleDeleteArticle = useCallback(
    async (id: string) => {
      if (articles) {
        const article = articles.find(
          (article: any) => article.objectID === id
        );

        if (article) {
          setDeletedArticle(article);
          deleteArticle(id);
          await addCachedDeletedId(id);
        }
      }
    },
    [articles, deleteArticle, setDeletedArticle]
  );

  const addArticleToFavourites = useCallback(
    async (id: string) => {
      if (articles) {
        const article = articles.find(
          (article: any) => article.objectID === id
        );

        const checkAlreadyFavourite = favouriteArticles.find(
          (article) => article.objectID === id
        );

        if (article && !checkAlreadyFavourite) {
          setFavouriteArticle(article);
          await addCachedFavouriteId(id);
        }
      }
    },
    [articles, favouriteArticles, setFavouriteArticle]
  );

  const removeDeletedArticles = useCallback(
    (data: IArticle[]) => {
      return data.filter((article: any) => {
        return !deletedArticles.some(
          (deleted) => deleted.objectID === article.objectID
        );
      });
    },
    [deletedArticles]
  );

  const getArticles = useCallback(async () => {
    try {
      const { isConnected } = await NetInfo.fetch();
      if (!isConnected) {
        const cached = await AsyncStorage.getItem(StorageKeys.ARTICLES_KEY);
        return cached ? setArticles(JSON.parse(cached)) : [];
      }

      const { data } = await axios.get(
        `/search_by_date?query=mobile&page=${page}`
      );

      const revisedArticles = removeDeletedArticles(data?.hits);
      setArticles(revisedArticles);
      updateCachedArticles(revisedArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  }, [page, removeDeletedArticles, setArticles]);

  const refreshArticles = useCallback(
    (callback: () => void) => {
      getArticles();
      if (callback) {
        callback();
        console.log("Callback executed after refresh");
      }
    },
    [getArticles]
  );

  const getStartingData = useCallback(async () => {
    try {
      const cachedArticles = await AsyncStorage.getItem(
        StorageKeys.ARTICLES_KEY
      );
      const cachedDeletedIds = await AsyncStorage.getItem(
        StorageKeys.DELETED_IDS_KEY
      );
      const cachedFavouriteIds = await AsyncStorage.getItem(
        StorageKeys.FAVOURITE_IDS_KEY
      );

      if (cachedArticles) {
        const retrievedArticles: IArticle[] = JSON.parse(cachedArticles);
        const deletedArticles: IArticle[] = [];
        const favouriteArticles: IArticle[] = [];

        retrievedArticles.forEach((article) => {
          if (
            cachedDeletedIds &&
            JSON.parse(cachedDeletedIds).includes(article.objectID)
          ) {
            deletedArticles.push(article);
          }

          if (
            cachedFavouriteIds &&
            JSON.parse(cachedFavouriteIds).includes(article.objectID)
          ) {
            favouriteArticles.push(article);
          }
        });

        setArticles(retrievedArticles);
        setDeletedArticles(deletedArticles);
        setFavouriteArticles(favouriteArticles);
        console.log("Starting data loaded from cache", {
          retrievedArticles,
          deletedArticles,
          favouriteArticles,
        });
      }
    } catch (error) {
      console.error("Error getting starting data:", error);
    }
  }, [setArticles, setDeletedArticles, setFavouriteArticles]);

  useEffect(() => {
    getArticles();
  }, [page, getArticles]);

  useEffect(() => {
    getStartingData();
  }, [getStartingData]);

  return {
    refreshArticles,
    deleteArticle: handleDeleteArticle,
    addArticleToFavourites,
  };
};

export default useGetArticles;
