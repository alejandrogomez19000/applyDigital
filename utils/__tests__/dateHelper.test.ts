import { formatRelativeTime } from "../dateHelper";

describe("formatRelativeTime", () => {
  const NOW = new Date("2025-01-01T12:00:00Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("returns 'just now' for a future date", () => {
    const future = new Date(NOW.getTime() + 10_000);

    expect(formatRelativeTime(future)).toBe("just now");
  });

  test("returns 'just now' for less than 1 minute ago", () => {
    const fiftySecondsAgo = new Date(NOW.getTime() - 50_000);

    expect(formatRelativeTime(fiftySecondsAgo)).toBe("just now");
  });

  test("returns '1 minute ago' for exactly 1 minute ago", () => {
    const oneMinuteAgo = new Date(NOW.getTime() - 60_000);

    expect(formatRelativeTime(oneMinuteAgo)).toBe("1 minute ago");
  });

  test("returns 'X minutes ago' for less than 60 minutes", () => {
    const tenMinutesAgo = new Date(NOW.getTime() - 10 * 60_000);

    expect(formatRelativeTime(tenMinutesAgo)).toBe("10 minutes ago");
  });

  test("returns '1 hour ago' for exactly 1 hour ago", () => {
    const oneHourAgo = new Date(NOW.getTime() - 60 * 60_000);

    expect(formatRelativeTime(oneHourAgo)).toBe("1 hour ago");
  });

  test("returns 'X hours ago' for less than 24 hours", () => {
    const fiveHoursAgo = new Date(NOW.getTime() - 5 * 60 * 60_000);

    expect(formatRelativeTime(fiveHoursAgo)).toBe("5 hours ago");
  });

  test("returns '1 day ago' for exactly 1 day ago", () => {
    const oneDayAgo = new Date(NOW.getTime() - 24 * 60 * 60_000);

    expect(formatRelativeTime(oneDayAgo)).toBe("1 day ago");
  });

  test("returns 'X days ago' for less than 7 days", () => {
    const threeDaysAgo = new Date(NOW.getTime() - 3 * 24 * 60 * 60_000);

    expect(formatRelativeTime(threeDaysAgo)).toBe("3 days ago");
  });

  test("returns '1 week ago' when diffDays is between 7 and 13", () => {
    const eightDaysAgo = new Date(NOW.getTime() - 8 * 24 * 60 * 60_000);

    expect(formatRelativeTime(eightDaysAgo)).toBe("1 week ago");
  });

  test("returns '2 weeks ago' when diffDays is about 14", () => {
    const fourteenDaysAgo = new Date(NOW.getTime() - 14 * 24 * 60 * 60_000);

    expect(formatRelativeTime(fourteenDaysAgo)).toBe("2 weeks ago");
  });

  test("returns '1 month ago' when diffDays is around 40", () => {
    const fortyDaysAgo = new Date(NOW.getTime() - 40 * 24 * 60 * 60_000);

    expect(formatRelativeTime(fortyDaysAgo)).toBe("1 month ago");
  });

  test("returns '2 months ago' when diffDays is around 75", () => {
    const seventyFiveDaysAgo = new Date(NOW.getTime() - 75 * 24 * 60 * 60_000);

    expect(formatRelativeTime(seventyFiveDaysAgo)).toBe("2 months ago");
  });

  test("accepts string ISO date input", () => {
    const twoMinutesAgo = new Date(NOW.getTime() - 2 * 60_000);

    expect(formatRelativeTime(twoMinutesAgo.toISOString())).toBe(
      "2 minutes ago"
    );
  });

  test("accepts numeric timestamp as seconds", () => {
    const threeMinutesAgoMs = NOW.getTime() - 3 * 60_000;
    const threeMinutesAgoSeconds = Math.floor(threeMinutesAgoMs / 1000);

    expect(formatRelativeTime(threeMinutesAgoSeconds)).toBe("3 minutes ago");
  });

  test("accepts Date instance directly", () => {
    const twoHoursAgo = new Date(NOW.getTime() - 2 * 60 * 60_000);

    expect(formatRelativeTime(twoHoursAgo)).toBe("2 hours ago");
  });

  test("falls back to toLocaleDateString for very old dates (>= 1 year)", () => {
    const twoYearsAgo = new Date("2023-01-01T12:00:00Z"); // 2 years before NOW

    const result = formatRelativeTime(twoYearsAgo);

    expect(result).not.toContain("minute");
    expect(result).not.toContain("hour");
    expect(result).not.toContain("day");
    expect(result).not.toContain("week");
    expect(result).not.toContain("month");
  });
});
