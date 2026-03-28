import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingProps {
  isLoading: true;
  loadingText?: string;
}

interface MessageProps {
  isLoading?: false;
  role: 'user' | 'assistant';
  content: string;
}

type Props = LoadingProps | MessageProps;

export function ChatBubble(props: Props) {
  if (props.isLoading) {
    return (
      <View style={styles.loadingBubble}>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#006EB7" />
          <Text style={styles.loadingText}>{props.loadingText ?? 'Denkt nach…'}</Text>
        </View>
      </View>
    );
  }

  const isUser = props.role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🤖</Text>
        </View>
      )}
      <View style={isUser ? styles.userBubble : styles.aiBubble}>
        <Text style={isUser ? styles.userText : styles.aiText}>{props.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  loadingText: { color: '#006EB7', fontSize: 13, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    flexShrink: 0,
    marginBottom: 2,
  },
  avatarEmoji: { fontSize: 16 },
  userBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#006EB7',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  userText: { fontSize: 15, lineHeight: 22, color: '#FFFFFF' },
  aiText: { fontSize: 15, lineHeight: 22, color: '#1E293B' },
});
