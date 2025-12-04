import { IArticle } from "@/interfaces/global";
import { create } from "zustand";

export interface ArticleStore {
  articles: IArticle[];
  deletedArticles: IArticle[];
  favouriteArticles: IArticle[];
  addNewArticle: (newArticle: IArticle) => void;
  setArticles: (articles: IArticle[]) => void;
  addDeletedArticle: (deletedArticle: IArticle) => void;
  addFavouriteArticle: (favouriteArticle: IArticle) => void;
  removeFromFavourites: (id: string) => void;
  removeFromDeleted: (id: string) => void;
  deleteArticle: (id: string) => void;
  setDeletedArticles: (deletedArticles: IArticle[]) => void;
  setFavouriteArticles: (favouriteArticles: IArticle[]) => void;
  clearDeletedArticles: () => void;
  clearFavouriteArticles: () => void;
}

export const useArticleStore = create<ArticleStore>((set) => ({
  articles: [],
  deletedArticles: [],
  favouriteArticles: [],
  addNewArticle: (newArticle) =>
    set((state) => ({
      ...state,
      articles: [newArticle, ...state.articles],
    })),
  setArticles: (articles) => set({ articles }),
  setDeletedArticles: (deletedArticles) => set({ deletedArticles }),
  setFavouriteArticles: (favouriteArticles) => set({ favouriteArticles }),
  addDeletedArticle: (deletedArticle) =>
    set((state) => ({
      ...state,
      deletedArticles: [...state.deletedArticles, deletedArticle],
    })),
  addFavouriteArticle: (favouriteArticle) =>
    set((state) => ({
      ...state,
      favouriteArticles: [...state.favouriteArticles, favouriteArticle],
    })),
  removeFromFavourites: (id: string) =>
    set((state) => ({
      ...state,
      favouriteArticles: state.favouriteArticles.filter((article) => article.objectID !== id),
    })),
  removeFromDeleted: (id: string) =>
    set((state) => ({
      ...state,
      deletedArticles: state.deletedArticles.filter((article) => article.objectID !== id),
    })),
  deleteArticle: (id: string) => {
    set((state) => ({
      ...state,
      articles: state.articles.filter((article) => article.objectID !== id),
    }));
  },
  clearDeletedArticles: () => {
    set((state) => ({
      ...state,
      deletedArticles: [],
    }));
  },
  clearFavouriteArticles: () => {
    set((state) => ({
      ...state,
      favouriteArticles: [],
    }));
  },
}));
