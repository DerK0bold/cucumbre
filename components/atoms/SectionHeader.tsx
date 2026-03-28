import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  subtitle?: string;
  rightText?: string;
}

export function SectionHeader({ title, subtitle, rightText }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {rightText && <Text style={styles.right}>{rightText}</Text>}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  right: { fontSize: 12, color: '#94A3B8' },
  subtitle: { color: '#64748B', fontSize: 13, marginTop: 4 },
});
