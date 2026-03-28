import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value?: string | number;
  unit: string;
}

export function NutritionItem({ label, value, unit }: Props) {
  if (!value) return null;
  return (
    <View style={styles.item}>
      <Text style={styles.value}>
        {value}<Text style={styles.unit}>{unit}</Text>
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  value: { color: '#1E293B', fontSize: 18, fontWeight: '800' },
  unit: { fontSize: 12, fontWeight: '400', color: '#64748B' },
  label: { color: '#64748B', fontSize: 11, marginTop: 4, textAlign: 'center' },
});
