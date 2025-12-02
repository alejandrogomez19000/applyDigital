import { IArticle } from "@/interfaces/global";
import { create } from "zustand";

export interface ArticleStore {
  articles: IArticle[];
  deletedArticles: IArticle[];
  favouriteArticles: IArticle[];
  setArticles: (articles: IArticle[]) => void;
  setDeletedArticle: (deletedArticle: IArticle) => void;
  setFavouriteArticle: (favouriteArticle: IArticle) => void;
  removeFromFavourites: (id: string) => void;
  removeFromDeleted: (id: string) => void;
  deleteArticle: (id: string) => void;
  setDeletedArticles: (deletedArticles: IArticle[]) => void;
  setFavouriteArticles: (favouriteArticles: IArticle[]) => void;
}

export const useArticleStore = create<ArticleStore>((set) => ({
  articles: [],
  deletedArticles: [],
  favouriteArticles: [],
  setArticles: (articles) => set({ articles }),
  setDeletedArticles: (deletedArticles) => set({ deletedArticles }),
  setFavouriteArticles: (favouriteArticles) => set({ favouriteArticles }),
  setDeletedArticle: (deletedArticle) =>
    set((state) => ({
      ...state,
      deletedArticles: [...state.deletedArticles, deletedArticle],
    })),
  setFavouriteArticle: (favouriteArticle) =>
    set((state) => ({
      ...state,
      favouriteArticles: [...state.favouriteArticles, favouriteArticle],
    })),
  removeFromFavourites: (id: string) =>
    set((state) => ({
      ...state,
      favouriteArticles: state.favouriteArticles.filter(
        (article) => article.objectID !== id
      ),
    })),
  removeFromDeleted: (id: string) =>
    set((state) => ({
      ...state,
      deletedArticles: state.deletedArticles.filter(
        (article) => article.objectID !== id
      ),
    })),
  deleteArticle: (id: string) => {
    set((state) => ({
      ...state,
      articles: state.articles.filter((article) => article.objectID !== id),
    }));
  },
}));
