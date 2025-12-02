import { Card } from "@/components/Card";
import { IArticle } from "@/interfaces/global";
import { useArticleStore } from "@/store/articleStore";
import React, { useEffect } from "react";
import { FlatList, View } from "react-native";

export default function SettingsScreen() {
  const { favouriteArticles } = useArticleStore();

  useEffect(() => {
    console.log(favouriteArticles, "favouriteArticles");
  }, [favouriteArticles]);

  const renderItems = ({ item }: { item: IArticle }) => (
    <Card article={item} disableDelete />
  );
  console.log(favouriteArticles, "favouriteArticles");

  return (
    <View style={{ paddingBottom: 10 }}>
      <FlatList
        style={{ padding: 16 }}
        data={favouriteArticles}
        keyExtractor={(item) => item.objectID}
        renderItem={renderItems}
      />
    </View>
  );
}
