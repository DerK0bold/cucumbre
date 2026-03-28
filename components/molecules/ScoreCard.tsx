import { View, Text, StyleSheet } from 'react-native';

interface Props {
  grade: string;
  label: string;
  color: string;
}

export function ScoreCard({ grade, label, color }: Props) {
  return (
    <View style={[styles.card, { borderColor: color }]}>
      <Text style={[styles.grade, { color }]}>{grade.toUpperCase()}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  grade: { fontSize: 28, fontWeight: '900' },
  label: { color: '#64748B', fontSize: 11, marginTop: 2 },
});
