import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {suggestions.map((s, i) => (
        <TouchableOpacity key={i} style={styles.chip} onPress={() => onSelect(s)} activeOpacity={0.7}>
          <Text style={styles.text}>{s}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 80, left: 0, right: 0, maxHeight: 40 },
  content: { paddingHorizontal: 16, gap: 10 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: { color: '#006EB7', fontSize: 13, fontWeight: '600' },
});
