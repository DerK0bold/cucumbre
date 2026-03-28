import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecentOrderProps {
  variant: 'recent';
  logo: string;
  retailer: string;
  orderId: string;
  status: string;
  isDone: boolean;
  onPress: () => void;
}

interface ExampleOrderProps {
  variant: 'example';
  logo: string;
  label: string;
  orderId: string;
  onPress: () => void;
}

type Props = RecentOrderProps | ExampleOrderProps;

export function OrderCard(props: Props) {
  if (props.variant === 'recent') {
    return (
      <TouchableOpacity style={styles.recentCard} onPress={props.onPress} activeOpacity={0.75}>
        <Text style={styles.logo}>{props.logo}</Text>
        <View style={styles.info}>
          <Text style={styles.recentRetailer}>{props.retailer}</Text>
          <Text style={styles.recentId}>{props.orderId}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.dot, props.isDone ? styles.dotDone : styles.dotActive]} />
          <Text style={[styles.statusText, props.isDone && styles.statusDone]}>
            {props.status}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#4B5563" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.exampleCard} onPress={props.onPress} activeOpacity={0.75}>
      <Text style={styles.logo}>{props.logo}</Text>
      <View style={styles.info}>
        <Text style={styles.exampleLabel}>{props.label}</Text>
        <Text style={styles.exampleId}>{props.orderId}</Text>
      </View>
      <View style={styles.tryBtn}>
        <Text style={styles.tryBtnText}>Verfolgen</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  logo: { fontSize: 28 },
  info: { flex: 1 },
  recentRetailer: { color: '#334155', fontSize: 14, fontWeight: '600' },
  recentId: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  exampleLabel: { color: '#006EB7', fontSize: 14, fontWeight: '600' },
  exampleId: { color: '#64748B', fontSize: 12, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotActive: { backgroundColor: '#006EB7' },
  dotDone: { backgroundColor: '#94A3B8' },
  statusText: { color: '#006EB7', fontSize: 12, fontWeight: '600' },
  statusDone: { color: '#64748B' },
  tryBtn: {
    backgroundColor: '#006EB7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tryBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
