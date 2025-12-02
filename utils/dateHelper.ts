export const formatRelativeTime = (
  createdAt: string | number | Date
): string => {
  const createdDate =
    createdAt instanceof Date
      ? createdAt
      : typeof createdAt === "number"
      ? new Date(createdAt * 1000)
      : new Date(createdAt);

  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();

  if (diffMs < 0) {
    return "just now";
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  if (diffDays < 7) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }

  if (diffDays > 7) {
    return diffDays < 14
      ? "1 week ago"
      : `${Math.floor(diffDays / 7)} weeks ago`;
  }

  if (diffDays > 30) {
    return diffDays < 60
      ? "1 month ago"
      : `${Math.floor(diffDays / 30)} months ago`;
  }

  return createdDate.toLocaleDateString();
};
