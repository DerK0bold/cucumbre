import { View, Text, StyleSheet } from 'react-native';

interface Step {
  emoji: string;
  title: string;
  desc: string;
}

interface Props {
  steps: Step[];
}

export function SupplyChainRow({ steps }: Props) {
  return (
    <View style={styles.row}>
      {steps.map((step, i) => (
        <View key={i} style={styles.item}>
          {i > 0 && <Text style={styles.arrow}>→</Text>}
          <View style={styles.step}>
            <Text style={styles.emoji}>{step.emoji}</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.desc}>{step.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 4,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  item: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  arrow: { color: '#CBD5E1', fontSize: 14, marginRight: 4 },
  step: { flex: 1, alignItems: 'center' },
  emoji: { fontSize: 22, marginBottom: 4 },
  title: { color: '#334155', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  desc: { color: '#94A3B8', fontSize: 9, textAlign: 'center', marginTop: 2 },
});
