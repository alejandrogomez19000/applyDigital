import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

type ArticleParams = {
  url?: string;
  title?: string;
};

export default function ArticleModal() {
  const { url } = useLocalSearchParams<ArticleParams>();

  return (
    <ThemedView style={styles.container}>
      {!url ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : (
        <WebView
          source={{ uri: url }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator />
            </View>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
