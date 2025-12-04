export interface IArticle {
  author: string;
  comment_text: string;
  created_at: string;
  created_at_i: number;
  objectID: string;
  parent_id: number;
  story_id: number;
  story_title?: string;
  story_url: string;
  updated_at: string;
  title?: string;
}
export type AppNotificationStatus = "granted" | "denied" | "undetermined";
