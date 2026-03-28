import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  iconName?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ iconName, emoji, title, text, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      {emoji ? (
        <Text style={styles.emoji}>{emoji}</Text>
      ) : iconName ? (
        <Ionicons name={iconName} size={64} color="#CBD5E1" />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#475569',
    marginTop: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  btn: {
    marginTop: 20,
    backgroundColor: '#006EB7',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
