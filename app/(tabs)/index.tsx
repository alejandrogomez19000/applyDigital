import { Card } from "@/components/Card";
import useGetArticles from "@/hooks/useArticles";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { articles } = useArticleStore();
  const { refreshArticles, deleteArticle, addArticleToFavourites } = useGetArticles({ page: 0 });

  const handleDelete = (id: string) => {
    console.log("Delete article with id:", id);
    deleteArticle(id);
  };

  const handleToggleFavourite = (id: string) => {
    addArticleToFavourites(id);
  };

  const renderItems = ({ item }: { item: IArticle }) => (
    <Card article={item} onDelete={handleDelete} onToggleFavourite={handleToggleFavourite} />
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshArticles(() => setRefreshing(false));
  }, [refreshArticles]);

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Text>Articles Count: {articles.length}</Text>
      </View>
      <FlatList
        style={{ padding: 16, flex: 1 }}
        data={articles}
        keyExtractor={(item) => item.objectID}
        renderItem={renderItems}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      />
    </View>
  );
}
