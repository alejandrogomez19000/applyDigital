import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { ThemedView } from "@/components/ThemedView";
import useGetArticles from "@/hooks/useArticles";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl } from "react-native";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { articles } = useArticleStore();
  const { refreshArticles, deleteArticle, addArticleToFavourites } = useGetArticles({ page: 0 });

  const handleDelete = (id: string) => {
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
    <ThemedView style={{ flex: 1 }}>
      <Header title="Articles" />
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
    </ThemedView>
  );
}
