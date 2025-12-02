import { IArticle } from "@/interfaces/global";

export const indexArticlesById = (
  array: IArticle[]
): Record<string, IArticle> => {
  return array.reduce((acc, item) => {
    acc[item.objectID] = item;
    return acc;
  }, {} as Record<string, IArticle>);
};
