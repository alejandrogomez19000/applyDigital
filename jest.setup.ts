import "@testing-library/jest-native/extend-expect";

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("react-native-gesture-handler", () => {
  return require("react-native-gesture-handler/jestSetup");
});

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest
    .fn()
    .mockReturnValue({ remove: jest.fn() }),
}));

jest.mock("expo-background-task", () => ({
  defineTask: jest.fn(),
  registerTaskAsync: jest.fn(),
  unregisterTaskAsync: jest.fn(),
  isRegisteredAsync: jest.fn().mockResolvedValue(false),
}));

jest.mock("expo-task-manager", () => ({
  defineTask: jest.fn(),
  unregisterAllTasksAsync: jest.fn(),
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
  getTaskOptionsAsync: jest.fn().mockResolvedValue({}),
}));
