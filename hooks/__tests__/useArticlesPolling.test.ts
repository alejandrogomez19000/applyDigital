import axios from "@/api/axios";
import { showNewArticleNotification } from "@/api/notifications";
import { useArticleStore } from "@/store/articleStore";
import { useNotificationStore } from "@/store/notificationStore";
import { act, renderHook } from "@testing-library/react-native";
import { useArticlesPolling } from "../useArticlesPolling";
import { useNotificationSettings } from "../useNotificationSettings";

jest.mock("@/api/axios");
jest.mock("@/api/notifications");
jest.mock("../useNotificationSettings");
jest.mock("@/store/articleStore");
jest.mock("@/store/notificationStore");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedShowNotification = showNewArticleNotification as jest.Mock;
const mockedUseNotificationSettings =
  useNotificationSettings as jest.MockedFunction<
    typeof useNotificationSettings
  >;
const mockedUseArticleStore = useArticleStore as jest.MockedFunction<
  typeof useArticleStore
>;
const mockedUseNotificationStore = useNotificationStore as jest.MockedFunction<
  typeof useNotificationStore
>;

describe("useArticlesPolling", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, "setInterval");
    jest.spyOn(global, "clearInterval");

    mockedShowNotification.mockReset();
    mockedAxios.get.mockReset();
    mockedAxios.get.mockResolvedValue({ data: { hits: [] } });

    mockedUseArticleStore.mockReturnValue({
      addNewArticle: jest.fn(),
    } as any);

    mockedUseNotificationStore.mockReturnValue({
      filters: ["android", "ios"],
    } as any);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("asks for permission and does not fetch when app notifications are disabled", () => {
    const askPermission = jest.fn();

    mockedUseNotificationSettings.mockReturnValue({
      appEnabled: false,
      askPermission,
    } as any);

    renderHook(() => useArticlesPolling());

    expect(askPermission).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test("first fetch sets latestCreatedAt but does not trigger notifications", async () => {
    mockedUseNotificationSettings.mockReturnValue({
      appEnabled: true,
      askPermission: jest.fn(),
    } as any);

    const firstArticle = {
      objectID: "1",
      title: "Android performance tips",
      story_title: null,
      story_url: "https://example.com/android",
      created_at: "2025-01-01T12:00:00.000Z",
      author: "alice",
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: { hits: [firstArticle] },
    });

    renderHook(() => useArticlesPolling());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedShowNotification).not.toHaveBeenCalled();
  });

  test("second poll with newer filtered article triggers notification", async () => {
    mockedUseNotificationSettings.mockReturnValue({
      appEnabled: true,
      askPermission: jest.fn(),
    } as any);

    const firstArticle = {
      objectID: "1",
      title: "Generic mobile news",
      story_title: null,
      story_url: "https://example.com/mobile",
      created_at: "2025-01-01T12:00:00.000Z",
      author: "alice",
    };

    const newerAndroidArticle = {
      objectID: "2",
      title: "Android 15 released",
      story_title: null,
      story_url: "https://example.com/android-15",
      created_at: "2025-01-01T12:05:00.000Z",
      author: "bob",
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: { hits: [firstArticle] },
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: { hits: [newerAndroidArticle, firstArticle] },
    });

    renderHook(() => useArticlesPolling());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedShowNotification).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);

    expect(mockedShowNotification).toHaveBeenCalledTimes(1);
    expect(mockedShowNotification).toHaveBeenCalledWith({
      title: "Android 15 released",
      url: "https://example.com/android-15",
      body: "By bob",
    });
  });

  test("does not notify when new articles do not match filters", async () => {
    mockedUseNotificationSettings.mockReturnValue({
      appEnabled: true,
      askPermission: jest.fn(),
    } as any);

    const firstArticle = {
      objectID: "1",
      title: "Some generic topic",
      story_title: null,
      story_url: "https://example.com/other",
      created_at: "2025-01-01T12:00:00.000Z",
      author: "alice",
    };

    const newerNonMobileArticle = {
      objectID: "2",
      title: "Rust ownership deep dive",
      story_title: null,
      story_url: "https://example.com/rust",
      created_at: "2025-01-01T12:05:00.000Z",
      author: "bob",
    };

    mockedAxios.get
      .mockResolvedValueOnce({ data: { hits: [firstArticle] } })
      .mockResolvedValueOnce({
        data: { hits: [newerNonMobileArticle, firstArticle] },
      });

    renderHook(() => useArticlesPolling());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedShowNotification).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(mockedShowNotification).not.toHaveBeenCalled();
  });

  test("clears interval on unmount", async () => {
    mockedUseNotificationSettings.mockReturnValue({
      appEnabled: true,
      askPermission: jest.fn(),
    } as any);

    mockedAxios.get.mockResolvedValueOnce({
      data: { hits: [] },
    });

    const { unmount } = renderHook(() => useArticlesPolling());

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    expect(clearInterval).toHaveBeenCalled();
  });
});
