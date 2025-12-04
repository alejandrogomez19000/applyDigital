import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import {
  clearCachedDeletedArticles,
  removeCachedDeletedById,
  updateCachedArticles,
} from "@/utils/offlineHelper";
import React from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

export default function DeletedArticlesScreen() {
  const { articles, deletedArticles, clearDeletedArticles, setArticles, setDeletedArticles } =
    useArticleStore();

  const handleRestoreDeleted = (id: string) => {
    const updatedDeletedArticles = deletedArticles.filter((article) => article.objectID !== id);
    const deletedArticle = deletedArticles.find((article) => article.objectID === id);
    if (deletedArticle) {
      setArticles([...articles, deletedArticle]);
      setDeletedArticles(updatedDeletedArticles);
      removeCachedDeletedById(id);
      updateCachedArticles([...articles, deletedArticle]);
    }
  };

  const handleRestoreAll = () => {
    const updatedArticles = [...deletedArticles, ...articles];
    setArticles(updatedArticles);
    clearCachedDeletedArticles();
    clearDeletedArticles();
    updateCachedArticles(updatedArticles);
  };

  const renderItems = ({ item }: { item: IArticle }) => (
    <Card
      article={item}
      disableDelete
      isFromDeleted
      onDelete={() => handleRestoreDeleted(item.objectID)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.text}>Restore Deleted Articles</ThemedText>
        <Pressable onPress={handleRestoreAll}>
          <ThemedText style={styles.text}>Restore All</ThemedText>
        </Pressable>
      </ThemedView>
      <FlatList
        style={{ padding: 16 }}
        data={deletedArticles}
        keyExtractor={(item) => item.objectID}
        renderItem={renderItems}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
});
