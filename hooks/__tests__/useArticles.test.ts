import axios from "@/api/axios";
import { StorageKeys } from "@/constants/global";
import { useArticleStore } from "@/store/articleStore";
import {
  addCachedDeletedArticle,
  addCachedFavouriteArticle,
  updateCachedArticles,
} from "@/utils/offlineHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import useGetArticles from "../useArticles";

jest.mock("@/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(),
}));

jest.mock("@/utils/offlineHelper");

const mockStoreState = {
  articles: [] as any[],
  favouriteArticles: [] as any[],
  deletedArticles: [] as any[],
  setArticles: jest.fn(),
  addDeletedArticle: jest.fn(),
  deleteArticle: jest.fn(),
  addFavouriteArticle: jest.fn(),
  setDeletedArticles: jest.fn(),
  setFavouriteArticles: jest.fn(),
};

jest.mock("@/store/articleStore", () => ({
  __esModule: true,
  useArticleStore: jest.fn(),
}));

const mockedUseArticleStore = useArticleStore as unknown as jest.Mock;

const mockedAxios = axios as unknown as { get: jest.Mock };
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockedNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockedUpdateCachedArticles = updateCachedArticles as jest.Mock;
const mockedAddCachedDeletedArticle = addCachedDeletedArticle as jest.Mock;
const mockedAddCachedFavouriteArticle = addCachedFavouriteArticle as jest.Mock;

describe("useGetArticles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState.articles = [];
    mockStoreState.favouriteArticles = [];
    mockStoreState.deletedArticles = [];
    mockStoreState.setArticles.mockClear();
    mockStoreState.addDeletedArticle.mockClear();
    mockStoreState.deleteArticle.mockClear();
    mockStoreState.addFavouriteArticle.mockClear();
    mockStoreState.setDeletedArticles.mockClear();
    mockStoreState.setFavouriteArticles.mockClear();
    mockedUseArticleStore.mockReturnValue(mockStoreState);
  });

  it("fetches articles from API when online and filters deleted ones", async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);

    mockStoreState.deletedArticles = [{ objectID: "2" }];

    mockedAxios.get.mockResolvedValue({
      data: {
        hits: [
          { objectID: "1", title: "First" },
          { objectID: "2", title: "Deleted" },
        ],
      },
    });

    const { result } = renderHook(() => useGetArticles({ page: 0 }));

    await waitFor(() => {
      expect(mockStoreState.setArticles).toHaveBeenCalledWith([
        { objectID: "1", title: "First" }, // "2" filtered out
      ]);
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/search_by_date?query=mobile&page=0"
    );
    expect(mockedUpdateCachedArticles).toHaveBeenCalledWith([
      { objectID: "1", title: "First" },
    ]);

    expect(result.current.refreshArticles).toBeInstanceOf(Function);
    expect(result.current.deleteArticle).toBeInstanceOf(Function);
    expect(result.current.addArticleToFavourites).toBeInstanceOf(Function);
  });

  it("loads cached articles from AsyncStorage when offline", async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);

    const cachedArticles = [{ objectID: "10", title: "Cached article" }];

    mockedAsyncStorage.getItem.mockImplementation((key: string) => {
      if (key === StorageKeys.CACHED_ARTICLES) {
        return Promise.resolve(JSON.stringify(cachedArticles));
      }
      return Promise.resolve(null);
    });

    renderHook(() => useGetArticles({ page: 0 }));

    await waitFor(() => {
      expect(mockStoreState.setArticles).toHaveBeenCalledWith(cachedArticles);
    });

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("deleteArticle moves article to deleted and updates cache", async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedAxios.get.mockResolvedValue({ data: { hits: [] } });

    mockStoreState.articles = [
      { objectID: "1", title: "To delete" },
      { objectID: "2", title: "Keep" },
    ];

    const { result } = renderHook(() => useGetArticles({ page: 0 }));

    await act(async () => {
      await result.current.deleteArticle("1");
    });

    expect(mockStoreState.addDeletedArticle).toHaveBeenCalledWith({
      objectID: "1",
      title: "To delete",
    });
    expect(mockStoreState.deleteArticle).toHaveBeenCalledWith("1");
    expect(mockedUpdateCachedArticles).toHaveBeenCalledWith([
      { objectID: "2", title: "Keep" },
    ]);
    expect(mockedAddCachedDeletedArticle).toHaveBeenCalledWith({
      objectID: "1",
      title: "To delete",
    });
  });

  it("addArticleToFavourites adds article and caches it if not already favourite", async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedAxios.get.mockResolvedValue({ data: { hits: [] } });

    mockStoreState.articles = [
      { objectID: "1", title: "Article 1" },
      { objectID: "2", title: "Article 2" },
    ];
    mockStoreState.favouriteArticles = [];

    const { result, rerender } = renderHook(() => useGetArticles({ page: 0 }));

    await act(async () => {
      await result.current.addArticleToFavourites("1");
    });

    expect(mockStoreState.addFavouriteArticle).toHaveBeenCalledWith({
      objectID: "1",
      title: "Article 1",
    });
    expect(mockedAddCachedFavouriteArticle).toHaveBeenCalledWith({
      objectID: "1",
      title: "Article 1",
    });

    mockStoreState.addFavouriteArticle.mockClear();
    mockedAddCachedFavouriteArticle.mockClear();

    mockStoreState.favouriteArticles = [{ objectID: "1", title: "Article 1" }];

    await act(async () => {
      rerender(null);
    });

    await act(async () => {
      await result.current.addArticleToFavourites("1");
    });

    expect(mockStoreState.addFavouriteArticle).not.toHaveBeenCalled();
    expect(mockedAddCachedFavouriteArticle).not.toHaveBeenCalled();
  });

  it("loads starting cached data for articles, deleted and favourite", async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);

    const cachedArticles = [{ objectID: "1" }];
    const cachedDeleted = [{ objectID: "2" }];
    const cachedFavourite = [{ objectID: "3" }];

    mockedAsyncStorage.getItem.mockImplementation((key: string) => {
      switch (key) {
        case StorageKeys.CACHED_ARTICLES:
          return Promise.resolve(JSON.stringify(cachedArticles));
        case StorageKeys.CACHED_DELETED_ARTICLES:
          return Promise.resolve(JSON.stringify(cachedDeleted));
        case StorageKeys.CACHED_FAVOURITE_ARTICLES:
          return Promise.resolve(JSON.stringify(cachedFavourite));
        default:
          return Promise.resolve(null);
      }
    });

    renderHook(() => useGetArticles({ page: 0 }));

    await waitFor(() => {
      expect(mockStoreState.setArticles).toHaveBeenCalledWith(cachedArticles);
      expect(mockStoreState.setDeletedArticles).toHaveBeenCalledWith(
        cachedDeleted
      );
      expect(mockStoreState.setFavouriteArticles).toHaveBeenCalledWith(
        cachedFavourite
      );
    });
  });
});
