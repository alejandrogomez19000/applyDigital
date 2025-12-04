import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type HeaderProps = {
  title: string;
  showBack?: boolean;
};

export function Header({ title, showBack = false }: HeaderProps) {
  const navigation = useNavigation();

  return (
    <ThemedView style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <ThemedView style={styles.backPlaceholder} />
      )}

      <ThemedText style={styles.title}>{title}</ThemedText>

      <ThemedView style={styles.backPlaceholder} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  backBtn: {
    padding: 6,
  },
  backPlaceholder: {
    width: 32,
  },
});
