import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import { clearCachedFavouriteArticles, removeCachedFavouriteById } from "@/utils/offlineHelper";
import React from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

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
    clearFavouriteArticles();
    clearCachedFavouriteArticles();
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
      <ThemedView style={styles.header}>
        <ThemedText style={styles.text}>Remove all favourites</ThemedText>
        <Pressable onPress={handleRestoreAll}>
          <ThemedText style={styles.text}>Remove All</ThemedText>
        </Pressable>
      </ThemedView>
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
