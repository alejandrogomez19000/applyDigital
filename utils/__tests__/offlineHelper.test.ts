import { StorageKeys } from "@/constants/global";
import { IArticle } from "@/interfaces/global";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addCachedDeletedArticle,
  addCachedFavouriteArticle,
  clearCachedArticles,
  clearCachedDeletedArticles,
  clearCachedFavouriteArticles,
  getCachedDeletedArticles,
  getCachedFavouriteArticles,
  getCachedNotificationFilters,
  removeCachedDeletedById,
  removeCachedFavouriteById,
  setCachedNotificationFilters,
  updateCachedArticles,
} from "../offlineHelper";

describe("offlineHelper storage utils", () => {
  let warnSpy: jest.SpyInstance;

  const createArticle = (overrides: Partial<IArticle> = {}): IArticle => ({
    objectID: overrides.objectID ?? "1",
    title: overrides.title ?? "Test article",
    story_title: overrides.story_title ?? "Test story",
    story_url: overrides.story_url ?? "https://example.com",
    author: overrides.author ?? "alice",
    created_at: overrides.created_at ?? "2025-01-01T00:00:00Z",
    comment_text: "",
    created_at_i: 0,
    parent_id: 0,
    story_id: 0,
    updated_at: "",
  });

  beforeEach(async () => {
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test("getCachedDeletedArticles returns [] when no value is stored", async () => {
    const result = await getCachedDeletedArticles();
    expect(result).toEqual([]);
  });

  test("getCachedDeletedArticles returns parsed articles when stored", async () => {
    const articles = [
      createArticle({ objectID: "1" }),
      createArticle({ objectID: "2" }),
    ];
    await AsyncStorage.setItem(
      StorageKeys.CACHED_DELETED_ARTICLES,
      JSON.stringify(articles)
    );

    const result = await getCachedDeletedArticles();
    expect(result).toEqual(articles);
  });

  test("getCachedDeletedArticles returns [] and logs warning when JSON read fails", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error("boom")
    );

    const result = await getCachedDeletedArticles();

    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      "Error reading deleted articles",
      expect.any(Error)
    );
  });

  test("addCachedDeletedArticle appends article and dedupes by objectID", async () => {
    const article1 = createArticle({ objectID: "1" });

    await addCachedDeletedArticle(article1);
    let stored = await AsyncStorage.getItem(
      StorageKeys.CACHED_DELETED_ARTICLES
    );
    let parsed = JSON.parse(stored as string);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(article1);

    await addCachedDeletedArticle(article1);
    stored = await AsyncStorage.getItem(StorageKeys.CACHED_DELETED_ARTICLES);
    parsed = JSON.parse(stored as string);
    expect(parsed).toHaveLength(1);
  });

  test("removeCachedDeletedById removes only the matching article", async () => {
    const article1 = createArticle({ objectID: "1" });
    const article2 = createArticle({ objectID: "2" });

    await AsyncStorage.setItem(
      StorageKeys.CACHED_DELETED_ARTICLES,
      JSON.stringify([article1, article2])
    );

    await removeCachedDeletedById("1");

    const stored = await AsyncStorage.getItem(
      StorageKeys.CACHED_DELETED_ARTICLES
    );
    const parsed = JSON.parse(stored as string);

    expect(parsed).toEqual([article2]);
  });

  test("clearCachedDeletedArticles removes deleted articles key", async () => {
    const article = createArticle({ objectID: "1" });

    await AsyncStorage.setItem(
      StorageKeys.CACHED_DELETED_ARTICLES,
      JSON.stringify([article])
    );

    await clearCachedDeletedArticles();

    const stored = await AsyncStorage.getItem(
      StorageKeys.CACHED_DELETED_ARTICLES
    );
    expect(stored).toBeNull();
  });

  test("getCachedFavouriteArticles returns [] when no value is stored", async () => {
    const result = await getCachedFavouriteArticles();
    expect(result).toEqual([]);
  });

  test("addCachedFavouriteArticle appends and dedupes", async () => {
    const article = createArticle({ objectID: "fav-1" });

    await addCachedFavouriteArticle(article);
    let stored = await AsyncStorage.getItem(
      StorageKeys.CACHED_FAVOURITE_ARTICLES
    );
    let parsed = JSON.parse(stored as string);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(article);

    await addCachedFavouriteArticle(article);
    stored = await AsyncStorage.getItem(StorageKeys.CACHED_FAVOURITE_ARTICLES);
    parsed = JSON.parse(stored as string);
    expect(parsed).toHaveLength(1);
  });

  test("removeCachedFavouriteById removes only the matching favourite article", async () => {
    const article1 = createArticle({ objectID: "fav-1" });
    const article2 = createArticle({ objectID: "fav-2" });

    await AsyncStorage.setItem(
      StorageKeys.CACHED_FAVOURITE_ARTICLES,
      JSON.stringify([article1, article2])
    );

    await removeCachedFavouriteById("fav-1");

    const stored = await AsyncStorage.getItem(
      StorageKeys.CACHED_FAVOURITE_ARTICLES
    );
    const parsed = JSON.parse(stored as string);

    expect(parsed).toEqual([article2]);
  });

  test("clearCachedFavouriteArticles removes favourite articles key", async () => {
    const article = createArticle({ objectID: "fav-1" });

    await AsyncStorage.setItem(
      StorageKeys.CACHED_FAVOURITE_ARTICLES,
      JSON.stringify([article])
    );

    await clearCachedFavouriteArticles();

    const stored = await AsyncStorage.getItem(
      StorageKeys.CACHED_FAVOURITE_ARTICLES
    );
    expect(stored).toBeNull();
  });

  test("updateCachedArticles stores the full articles list", async () => {
    const articles = [
      createArticle({ objectID: "1" }),
      createArticle({ objectID: "2" }),
    ];

    await updateCachedArticles(articles);

    const stored = await AsyncStorage.getItem(StorageKeys.CACHED_ARTICLES);
    expect(stored).toBe(JSON.stringify(articles));
  });

  test("clearCachedArticles removes cached articles key", async () => {
    const articles = [createArticle({ objectID: "1" })];

    await AsyncStorage.setItem(
      StorageKeys.CACHED_ARTICLES,
      JSON.stringify(articles)
    );

    await clearCachedArticles();

    const stored = await AsyncStorage.getItem(StorageKeys.CACHED_ARTICLES);
    expect(stored).toBeNull();
  });

  test("setCachedNotificationFilters stores filters as JSON", async () => {
    const filters = ["android", "ios"];

    await setCachedNotificationFilters(filters);

    const stored = await AsyncStorage.getItem(StorageKeys.NOTIFICATION_FILTERS);
    expect(stored).toBe(JSON.stringify(filters));
  });

  test("getCachedNotificationFilters returns [] when no filters are stored", async () => {
    const result = await getCachedNotificationFilters();
    expect(result).toEqual([]);
  });

  test("getCachedNotificationFilters returns parsed filters when stored", async () => {
    const filters = ["android", "ios"];

    await AsyncStorage.setItem(
      StorageKeys.NOTIFICATION_FILTERS,
      JSON.stringify(filters)
    );

    const result = await getCachedNotificationFilters();

    expect(result).toEqual(filters);
  });

  test("getCachedNotificationFilters returns [] and warns when JSON read fails", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error("filters-fail")
    );

    const result = await getCachedNotificationFilters();

    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      "Error reading notification filters",
      expect.any(Error)
    );
  });
});
