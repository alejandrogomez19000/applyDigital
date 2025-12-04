import axios from "@/api/axios";
import { StorageKeys } from "@/constants/global";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import {
  addCachedDeletedArticle,
  addCachedFavouriteArticle,
  updateCachedArticles,
} from "@/utils/offlineHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect } from "react";

const useGetArticles = ({ page = 0 }: { page?: number }) => {
  const {
    articles,
    setArticles,
    addDeletedArticle,
    deleteArticle,
    addFavouriteArticle,
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
          addDeletedArticle(article);
          deleteArticle(id);
          updateCachedArticles(articles.filter((a) => a.objectID !== id));
          await addCachedDeletedArticle(article);
        }
      }
    },
    [articles, deleteArticle, addDeletedArticle]
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
          addFavouriteArticle(article);
          await addCachedFavouriteArticle(article);
        }
      }
    },
    [articles, favouriteArticles, addFavouriteArticle]
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
        const cached = await AsyncStorage.getItem(StorageKeys.CACHED_ARTICLES);
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
        StorageKeys.CACHED_ARTICLES
      );
      const cachedDeleted = await AsyncStorage.getItem(
        StorageKeys.CACHED_DELETED_ARTICLES
      );
      const cachedFavourite = await AsyncStorage.getItem(
        StorageKeys.CACHED_FAVOURITE_ARTICLES
      );

      if (cachedArticles) {
        setArticles(JSON.parse(cachedArticles));
      }
      if (cachedDeleted) {
        setDeletedArticles(JSON.parse(cachedDeleted));
      }
      if (cachedFavourite) {
        setFavouriteArticles(JSON.parse(cachedFavourite));
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
