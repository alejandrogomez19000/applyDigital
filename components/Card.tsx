import { IArticle } from "@/interfaces/global";
import { useNavigation } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useArticleStore } from "@/store/articleStore";
import { formatRelativeTime } from "@/utils/dateHelper";
import { useMemo } from "react";
import { scheduleOnRN } from "react-native-worklets";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

type CardProps = {
  article: IArticle;
  onDelete?: (id: string) => void;
  disableDelete?: boolean;
  onToggleFavourite?: (id: string) => void;
  isFromDeleted?: boolean;
  isFromFavourite?: boolean;
};

const DELETE_SWIPE_THRESHOLD = -120;
const FAVOURITES_SWIPE_THRESHOLD = 120;
const MAX_SWIPE = 160;

export function Card({
  article,
  onDelete,
  onToggleFavourite,
  isFromDeleted,
  isFromFavourite,
}: CardProps) {
  const { favouriteArticles } = useArticleStore();

  const navigation = useNavigation<any>();
  const translateX = useSharedValue(0);

  const title = article.title || article.story_title || "No Title";
  const author = article.author;
  const createdAt = article.created_at;

  const formattedTime = formatRelativeTime(createdAt);
  const handleOnDelete = () => {
    if (onDelete) {
      Alert.alert(
        isFromDeleted ? "Restore Article" : "Delete Article",
        isFromDeleted
          ? "Are you sure you want to restore this article?"
          : "Are you sure you want to delete this article?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              translateX.value = withSpring(0);
            },
          },
          {
            text: isFromDeleted ? "Restore" : "Delete",
            style: "destructive",
            onPress: () => {
              onDelete(article.objectID);
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleOnToggleFavourite = () => {
    if (onToggleFavourite) {
      Alert.alert(
        "Add to Favourites",
        "Are you sure you want to add this article to favourites?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              translateX.value = withSpring(0);
            },
          },
          {
            text: "Add",
            style: "destructive",
            onPress: () => {
              onToggleFavourite(article.objectID);
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleOnArticlePress = () => {
    navigation.navigate("articleModal", {
      url: article.story_url,
      title: title,
    });
  };

  const gesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      let nextX = e.translationX;
      if (nextX > MAX_SWIPE) nextX = MAX_SWIPE;
      if (nextX < -MAX_SWIPE) nextX = -MAX_SWIPE;

      if ((isFromFavourite || isFromDeleted) && nextX > 0) {
        translateX.value = 0;
      } else {
        translateX.value = nextX;
      }
    })
    .onEnd(() => {
      if (translateX.value < DELETE_SWIPE_THRESHOLD) {
        translateX.value = withTiming(-MAX_SWIPE, {}, () => {
          scheduleOnRN(handleOnDelete);
        });
        return;
      }

      if (translateX.value > FAVOURITES_SWIPE_THRESHOLD && !isFromFavourite && !isFromDeleted) {
        translateX.value = withTiming(MAX_SWIPE, {}, () => {
          scheduleOnRN(handleOnToggleFavourite);
          translateX.value = withSpring(0);
        });
        return;
      }

      translateX.value = withSpring(0);
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isFavourite = useMemo(() => {
    return favouriteArticles.some((fav) => fav.objectID === article.objectID);
  }, [favouriteArticles, article.objectID]);

  return (
    <GestureHandlerRootView>
      <View style={{ position: "relative" }}>
        <View style={styles.actionsContainer}>
          <View style={[styles.actionSide, styles.favouriteBackground]}>
            <View style={styles.iconWrapperLeft}>
              <IconSymbol size={28} name="star.fill" color="#fff" />
            </View>
          </View>

          <View style={[styles.actionSide, styles.deleteBackground]}>
            <View style={styles.iconWrapperRight}>
              <IconSymbol size={28} name="trash.fill" color="#fff" />
            </View>
          </View>
        </View>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[rStyle]}>
            <Pressable onPress={handleOnArticlePress}>
              <ThemedView style={styles.card}>
                <View style={styles.favouriteStar}>
                  <IconSymbol size={16} name="star.fill" color={isFavourite ? "#FFD93B" : "#ccc"} />
                </View>
                <ThemedText numberOfLines={1} ellipsizeMode="tail">
                  {title}
                </ThemedText>
                <ThemedText type="secondary">
                  {author} - {formattedTime}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    width: "100%",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 80,
  },
  deleteContainer: {
    position: "absolute",
    top: 8,
    right: 0,
    backgroundColor: "#ff3b30",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "flex-end",
    height: 80,
    width: "100%",
  },
  deleteButton: {
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  actionsContainer: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    overflow: "hidden",
  },
  actionSide: {
    flex: 1,
    justifyContent: "center",
  },
  favouriteBackground: {
    backgroundColor: "#FFD93B",
  },
  deleteBackground: {
    backgroundColor: "#FF3B30",
    alignItems: "flex-end",
  },
  iconWrapperLeft: {
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  iconWrapperRight: {
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  favouriteStar: {
    position: "absolute",
    top: 5,
    right: 5,
  },
});
