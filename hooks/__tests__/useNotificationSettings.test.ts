import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import { useNotificationSettings } from "../useNotificationSettings";

import {
  getNotificationPermissionStatus,
  openSystemNotificationSettings,
  requestNotificationPermission,
} from "@/api/nofiticationPermission";
import { useNotificationStore } from "@/store/notificationStore";
import {
  getCachedNotificationFilters,
  setCachedNotificationFilters,
} from "@/utils/offlineHelper";

jest.mock("@react-native-async-storage/async-storage");
jest.mock("@/api/nofiticationPermission");
jest.mock("@/store/notificationStore");
jest.mock("@/utils/offlineHelper");

const mockedGetNotificationPermissionStatus =
  getNotificationPermissionStatus as jest.MockedFunction<
    typeof getNotificationPermissionStatus
  >;
const mockedOpenSystemNotificationSettings =
  openSystemNotificationSettings as jest.MockedFunction<
    typeof openSystemNotificationSettings
  >;
const mockedRequestNotificationPermission =
  requestNotificationPermission as jest.MockedFunction<
    typeof requestNotificationPermission
  >;

const mockedUseNotificationStore = useNotificationStore as jest.MockedFunction<
  typeof useNotificationStore
>;
const mockedGetCachedNotificationFilters =
  getCachedNotificationFilters as jest.MockedFunction<
    typeof getCachedNotificationFilters
  >;
const mockedSetCachedNotificationFilters =
  setCachedNotificationFilters as jest.MockedFunction<
    typeof setCachedNotificationFilters
  >;

describe("useNotificationSettings", () => {
  let setFiltersMock: jest.Mock;

  beforeEach(() => {
    setFiltersMock = jest.fn();

    mockedUseNotificationStore.mockReturnValue({
      setFilters: setFiltersMock,
    } as any);

    mockedGetNotificationPermissionStatus.mockResolvedValue("granted");
    mockedGetCachedNotificationFilters.mockResolvedValue(["android", "ios"]);

    (AsyncStorage.setItem as jest.Mock).mockClear();
    mockedSetCachedNotificationFilters.mockClear();
    setFiltersMock.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const flushEffects = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  test("initially loads OS notification status, sets appEnabled and filters, and turns loading off", async () => {
    mockedGetNotificationPermissionStatus.mockResolvedValue("granted");
    mockedGetCachedNotificationFilters.mockResolvedValue(["android"]);

    const { result } = renderHook(() => useNotificationSettings());

    expect(result.current.loading).toBe(true);

    await flushEffects();

    expect(mockedGetNotificationPermissionStatus).toHaveBeenCalledTimes(1);
    expect(mockedGetCachedNotificationFilters).toHaveBeenCalledTimes(1);
    expect(setFiltersMock).toHaveBeenCalledWith(["android"]);

    expect(result.current.osStatus).toBe("granted");
    expect(result.current.appEnabled).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  test("sets appEnabled to false when OS permission is not granted", async () => {
    mockedGetNotificationPermissionStatus.mockResolvedValue("denied");

    const { result } = renderHook(() => useNotificationSettings());

    await flushEffects();

    expect(result.current.osStatus).toBe("denied");
    expect(result.current.appEnabled).toBe(false);
  });

  test("setAppEnabled toggles state and persists flag to AsyncStorage", async () => {
    mockedGetNotificationPermissionStatus.mockResolvedValue("granted");

    const { result } = renderHook(() => useNotificationSettings());
    await flushEffects();

    expect(result.current.appEnabled).toBe(true);

    await act(async () => {
      await result.current.setAppEnabled(false);
    });

    expect(result.current.appEnabled).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "app_notifications_enabled",
      "false"
    );

    await act(async () => {
      await result.current.setAppEnabled(true);
    });

    expect(result.current.appEnabled).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "app_notifications_enabled",
      "true"
    );
  });

  test("askPermission requests OS permission and updates osStatus", async () => {
    mockedGetNotificationPermissionStatus.mockResolvedValue("undetermined");
    mockedRequestNotificationPermission.mockResolvedValue("granted");

    const { result } = renderHook(() => useNotificationSettings());
    await flushEffects();

    expect(result.current.osStatus).toBe("undetermined");

    let returnedStatus: any;
    await act(async () => {
      returnedStatus = await result.current.askPermission();
    });

    expect(mockedRequestNotificationPermission).toHaveBeenCalledTimes(1);
    expect(returnedStatus).toBe("granted");
    expect(result.current.osStatus).toBe("granted");
  });

  test("handleSetNotificationFilters caches and updates filters in the store", async () => {
    const { result } = renderHook(() => useNotificationSettings());
    await flushEffects();

    const newFilters = ["android", "ios", "react native"];

    act(() => {
      result.current.handleSetNotificationFilters(newFilters);
    });

    expect(mockedSetCachedNotificationFilters).toHaveBeenCalledWith(newFilters);
    expect(setFiltersMock).toHaveBeenCalledWith(newFilters);
  });

  test("exposes openSystemSettings as openSystemNotificationSettings", async () => {
    const { result } = renderHook(() => useNotificationSettings());
    await flushEffects();

    mockedOpenSystemNotificationSettings.mockResolvedValue(undefined as any);

    await act(async () => {
      await result.current.openSystemSettings();
    });

    expect(mockedOpenSystemNotificationSettings).toHaveBeenCalledTimes(1);
  });
});
