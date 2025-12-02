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

export enum StorageKeys {
  DELETED_IDS_KEY = "deleted_item_ids",
  ARTICLES_KEY = "cached_articles",
  FAVOURITE_IDS_KEY = "favourite_item_ids",
}
