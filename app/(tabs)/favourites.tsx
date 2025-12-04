import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { ThemedView } from "@/components/ThemedView";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import { clearCachedFavouriteArticles, removeCachedFavouriteById } from "@/utils/offlineHelper";
import { Alert, FlatList, StyleSheet } from "react-native";

export default function FavouritesArticlesScreen() {
  const { favouriteArticles, clearFavouriteArticles, setFavouriteArticles } = useArticleStore();

  const handleRemoveFromFavourite = (id: string) => {
    const updatedFavouriteArticles = favouriteArticles.filter((article) => article.objectID !== id);
    if (updatedFavouriteArticles) {
      setFavouriteArticles(updatedFavouriteArticles);
      removeCachedFavouriteById(id);
    }
  };

  const handleRestoreAll = () => {
    if (favouriteArticles.length > 0) {
      Alert.alert(
        "Do you want to unselect all favourite articles?",
        "Are you sure you want to unselect all favourite articles?",
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
              clearFavouriteArticles();
              clearCachedFavouriteArticles();
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
      isFromFavourite
      disableDelete
      onDelete={() => handleRemoveFromFavourite(item.objectID)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Favourite Articles"
        actionCallback={handleRestoreAll}
        actionButtonText="Remove All"
      />
      <FlatList
        style={{ padding: 16 }}
        data={favouriteArticles}
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
