import { Card } from "@/components/Card";
import useGetArticles from "@/hooks/useArticles";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { articles } = useArticleStore();
  const { refreshArticles, deleteArticle, addArticleToFavourites } =
    useGetArticles({ page: 1 });

  const handleDelete = (id: string) => {
    console.log("Delete article with id:", id);
    deleteArticle(id);
  };

  const handleToggleFavourite = (id: string) => {
    addArticleToFavourites(id);
  };

  const renderItems = ({ item }: { item: IArticle }) => (
    <Card
      article={item}
      onDelete={handleDelete}
      onToggleFavourite={handleToggleFavourite}
    />
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshArticles(() => setRefreshing(false));
  }, [refreshArticles]);

  return (
    <View style={{ paddingBottom: 10 }}>
      <FlatList
        style={{ padding: 16 }}
        data={articles}
        keyExtractor={(item) => item.objectID}
        renderItem={renderItems}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
