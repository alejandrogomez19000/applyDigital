import { StorageKeys } from "@/constants/global";
import { IArticle } from "@/interfaces/global";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getCachedDeletedArticles = async (): Promise<IArticle[]> => {
  try {
    const value = await AsyncStorage.getItem(StorageKeys.CACHED_DELETED_ARTICLES);
    if (!value) return [];
    return JSON.parse(value);
  } catch (e) {
    console.warn("Error reading deleted articles", e);
    return [];
  }
};

export const getCachedFavouriteArticles = async (): Promise<IArticle[]> => {
  try {
    const value = await AsyncStorage.getItem(StorageKeys.CACHED_FAVOURITE_ARTICLES);
    if (!value) return [];
    return JSON.parse(value);
  } catch (e) {
    console.warn("Error reading favourite articles", e);
    return [];
  }
};

export const addCachedDeletedArticle = async (article: IArticle): Promise<void> => {
  try {
    const current = await getCachedDeletedArticles();
    if (current.some((item) => item.objectID === article.objectID)) return;
    const updated = [...current, article];
    await AsyncStorage.setItem(StorageKeys.CACHED_DELETED_ARTICLES, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error saving deleted article", e);
  }
};

export const removeCachedDeletedById = async (id: string): Promise<void> => {
  try {
    const current = await getCachedDeletedArticles();
    const updated = current.filter((x) => x.objectID !== id);
    await AsyncStorage.setItem(StorageKeys.CACHED_DELETED_ARTICLES, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error removing deleted article", e);
  }
};

export const clearCachedDeletedArticles = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(StorageKeys.CACHED_DELETED_ARTICLES);
  } catch (e) {
    console.warn("Error clearing deleted articles", e);
  }
};

export const clearCachedFavouriteArticles = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(StorageKeys.CACHED_FAVOURITE_ARTICLES);
  } catch (e) {
    console.warn("Error clearing favourite articles", e);
  }
};

export const clearCachedArticles = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(StorageKeys.CACHED_ARTICLES);
  } catch (e) {
    console.warn("Error clearing articles", e);
  }
};

export const removeCachedFavouriteById = async (id: string): Promise<void> => {
  try {
    const current = await getCachedFavouriteArticles();
    const updated = current.filter((x) => x.objectID !== id);
    await AsyncStorage.setItem(StorageKeys.CACHED_FAVOURITE_ARTICLES, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error removing favourite article", e);
  }
};

export const addCachedFavouriteArticle = async (article: IArticle): Promise<void> => {
  try {
    const current = await getCachedFavouriteArticles();
    if (current.some((item) => item.objectID === article.objectID)) return;
    const updated = [...current, article];
    await AsyncStorage.setItem(StorageKeys.CACHED_FAVOURITE_ARTICLES, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error saving favourite article", e);
  }
};

export const updateCachedArticles = async (articles: IArticle[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(StorageKeys.CACHED_ARTICLES, JSON.stringify(articles));
  } catch (e) {
    console.warn("Error updating cached articles", e);
  }
};

export const setCachedNotificationFilters = async (filters: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(StorageKeys.NOTIFICATION_FILTERS, JSON.stringify(filters));
  } catch (error) {
    console.warn("Error saving notification filters", error);
  }
};

export const getCachedNotificationFilters = async (): Promise<string[]> => {
  try {
    const value = await AsyncStorage.getItem(StorageKeys.NOTIFICATION_FILTERS);
    if (!value) return [];
    return JSON.parse(value);
  } catch (e) {
    console.warn("Error reading notification filters", e);
    return [];
  }
};
