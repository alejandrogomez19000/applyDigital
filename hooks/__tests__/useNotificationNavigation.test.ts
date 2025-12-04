import { act, renderHook } from "@testing-library/react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useNotificationNavigation } from "../useNotificationNavigation";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("expo-notifications");

const mockedUseRouter = useRouter as jest.Mock;
const mockedAddNotificationResponseReceivedListener =
  Notifications.addNotificationResponseReceivedListener as jest.Mock;

describe("useNotificationNavigation", () => {
  let pushMock: jest.Mock;
  let removeMock: jest.Mock;
  let listener: (response: any) => void;

  beforeEach(() => {
    pushMock = jest.fn();
    removeMock = jest.fn();
    listener = undefined as any;

    mockedUseRouter.mockReturnValue({
      push: pushMock,
    });

    mockedAddNotificationResponseReceivedListener.mockImplementation(
      (cb: (response: any) => void) => {
        listener = cb;
        return { remove: removeMock };
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("subscribes to notification responses on mount", () => {
    renderHook(() => useNotificationNavigation());

    expect(mockedAddNotificationResponseReceivedListener).toHaveBeenCalledTimes(
      1
    );
    expect(typeof listener).toBe("function");
  });

  test("navigates to /articleModal when notification contains url in data", () => {
    renderHook(() => useNotificationNavigation());

    const response = {
      notification: {
        request: {
          content: {
            data: {
              url: "https://example.com/article",
            },
          },
        },
      },
    } as any;

    act(() => {
      listener(response);
    });

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith({
      pathname: "/articleModal",
      params: { url: "https://example.com/article" },
    });
  });

  test("does not navigate when response is null", () => {
    renderHook(() => useNotificationNavigation());

    act(() => {
      listener(null as any);
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  test("does not navigate when data is missing", () => {
    renderHook(() => useNotificationNavigation());

    const response = {
      notification: {
        request: {
          content: {},
        },
      },
    } as any;

    act(() => {
      listener(response);
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  test("does not navigate when url is missing from data", () => {
    renderHook(() => useNotificationNavigation());

    const response = {
      notification: {
        request: {
          content: {
            data: {
              foo: "bar",
            },
          },
        },
      },
    } as any;

    act(() => {
      listener(response);
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  test("cleans up subscription on unmount", () => {
    const { unmount } = renderHook(() => useNotificationNavigation());

    unmount();

    expect(removeMock).toHaveBeenCalledTimes(1);
  });
});
