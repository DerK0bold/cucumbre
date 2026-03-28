import { View, Text, StyleSheet } from 'react-native';

interface Props {
  logo: string;
  name: string;
  prefix: string;
}

export function RetailerChip({ logo, name, prefix }: Props) {
  return (
    <View style={styles.chip}>
      <Text style={styles.logo}>{logo}</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.prefix}>{prefix}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logo: { fontSize: 22, marginBottom: 4 },
  name: { color: '#334155', fontSize: 12, fontWeight: '600' },
  prefix: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
});
