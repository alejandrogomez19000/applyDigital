import { useThemeColor } from "@/hooks/useThemeColor";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol, IconSymbolName } from "./ui/IconSymbol";

type HeaderProps = {
  title: string;
  actionCallback?: () => void;
  actionIconName?: IconSymbolName;
};

export function Header({ title, actionCallback, actionIconName }: HeaderProps) {
  const textColor = useThemeColor({}, "text");

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedView style={styles.backPlaceholder} />
      {actionCallback && actionIconName ? (
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.5 : 1 }]}
          onPress={actionCallback}
        >
          <IconSymbol name={actionIconName} size={20} color={textColor} />
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
  },
  backPlaceholder: {
    width: 32,
  },
});
