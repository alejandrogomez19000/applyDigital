import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type HeaderProps = {
  title: string;
  actionCallback?: () => void;
  actionButtonText?: string;
};

export function Header({ title, actionCallback, actionButtonText }: HeaderProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedView style={styles.backPlaceholder} />
      {actionCallback && actionButtonText ? (
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.5 : 1 }]}
          onPress={actionCallback}
        >
          <ThemedText style={styles.buttonText}>{actionButtonText}</ThemedText>
        </Pressable>
      ) : (
        <ThemedView style={styles.backPlaceholder} />
      )}
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
    textAlign: "center",
  },
  backBtn: {
    padding: 6,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  backPlaceholder: {
    width: 32,
  },
  buttonText: {
    fontSize: 14,
    color: "#fff",
  },
});
