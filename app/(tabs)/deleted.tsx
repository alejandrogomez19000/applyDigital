import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { ThemedView } from "@/components/ThemedView";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import {
  clearCachedDeletedArticles,
  removeCachedDeletedById,
  updateCachedArticles,
} from "@/utils/offlineHelper";
import { Alert, FlatList, StyleSheet } from "react-native";

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
    if (deletedArticles.length > 0) {
      Alert.alert(
        "Do you want to restore all deleted articles?",
        "Are you sure you want to restore all deleted articles?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {},
          },
          {
            text: "Add",
            style: "destructive",
            onPress: () => {
              const updatedArticles = [...deletedArticles, ...articles];
              setArticles(updatedArticles);
              clearCachedDeletedArticles();
              clearDeletedArticles();
              updateCachedArticles(updatedArticles);
            },
          },
        ],
        { cancelable: true }
      );
    }
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
      <Header
        title="Deleted Articles"
        actionCallback={handleRestoreAll}
        actionButtonText="Restore All"
      />
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
