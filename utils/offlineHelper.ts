import { IArticle, StorageKeys } from "@/interfaces/global";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getCachedDeletedIds = async (): Promise<string[]> => {
  try {
    const value = await AsyncStorage.getItem(StorageKeys.DELETED_IDS_KEY);
    if (!value) return [];
    return JSON.parse(value);
  } catch (e) {
    console.warn("Error reading deleted ids", e);
    return [];
  }
};

export const getCachedFavouriteIds = async (): Promise<string[]> => {
  try {
    const value = await AsyncStorage.getItem(StorageKeys.FAVOURITE_IDS_KEY);
    if (!value) return [];
    return JSON.parse(value);
  } catch (e) {
    console.warn("Error reading deleted ids", e);
    return [];
  }
};

export const addCachedDeletedId = async (id: string): Promise<void> => {
  try {
    const current = await getCachedDeletedIds();
    if (current.includes(id)) return;
    const updated = [...current, id];
    await AsyncStorage.setItem(
      StorageKeys.DELETED_IDS_KEY,
      JSON.stringify(updated)
    );
  } catch (e) {
    console.warn("Error saving deleted id", e);
  }
};

export const removeCachedDeletedId = async (id: string): Promise<void> => {
  try {
    const current = await getCachedDeletedIds();
    const updated = current.filter((x) => x !== id);
    await AsyncStorage.setItem(
      StorageKeys.DELETED_IDS_KEY,
      JSON.stringify(updated)
    );
  } catch (e) {
    console.warn("Error removing deleted id", e);
  }
};

export const clearCachedDeletedIds = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(StorageKeys.DELETED_IDS_KEY);
  } catch (e) {
    console.warn("Error clearing deleted ids", e);
  }
};

export const removeCachedFavouriteId = async (id: string): Promise<void> => {
  try {
    const current = await getCachedFavouriteIds();
    const updated = current.filter((x) => x !== id);
    await AsyncStorage.setItem(
      StorageKeys.FAVOURITE_IDS_KEY,
      JSON.stringify(updated)
    );
  } catch (e) {
    console.warn("Error removing deleted id", e);
  }
};

export const addCachedFavouriteId = async (id: string): Promise<void> => {
  try {
    const current = await getCachedFavouriteIds();
    if (current.includes(id)) return;
    const updated = [...current, id];
    await AsyncStorage.setItem(
      StorageKeys.FAVOURITE_IDS_KEY,
      JSON.stringify(updated)
    );
  } catch (e) {
    console.warn("Error saving favourite id", e);
  }
};

export const updateCachedArticles = async (
  articles: IArticle[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      StorageKeys.ARTICLES_KEY,
      JSON.stringify(articles)
    );
  } catch (e) {
    console.warn("Error updating cached articles", e);
  }
};
