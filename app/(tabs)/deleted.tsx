import { Card } from "@/components/Card";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import React from "react";
import { FlatList, View } from "react-native";

export default function DeletedArticlesScreen() {
  const { deletedArticles } = useArticleStore();

  const renderItems = ({ item }: { item: IArticle }) => (
    <Card article={item} disableDelete />
  );
  console.log(deletedArticles, "deletedArticles");

  return (
    <View style={{ paddingBottom: 10 }}>
      <FlatList
        style={{ padding: 16 }}
        data={deletedArticles}
        keyExtractor={(item) => item.objectID}
        renderItem={renderItems}
      />
    </View>
  );
}
