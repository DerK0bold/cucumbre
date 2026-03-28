import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PantryItem } from '../../services/pantryService';

interface Props {
  item: PantryItem;
  onDelete: (id: string) => void;
}

function getUrgencyColor(days: number) {
  if (days <= 2) return '#EF4444';
  if (days <= 5) return '#F59E0B';
  return '#10B981';
}

export function PantryItemCard({ item, onDelete }: Props) {
  const color = getUrgencyColor(item.daysLeft);
  const progress = Math.max(0, Math.min(100, (item.daysLeft / 14) * 100));

  return (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text>📦</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.brand}>{item.brand || 'Unbekannte Marke'}</Text>
        <View style={styles.statusRow}>
          <Text style={[styles.daysText, { color }]}>
            {item.daysLeft <= 0 ? 'Abgelaufen' : `Noch ca. ${item.daysLeft} Tage`}
          </Text>
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: { width: 80, height: 80, borderRadius: 12 },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  brand: { fontSize: 13, color: '#64748B', marginBottom: 6 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  daysText: { fontSize: 12, fontWeight: '700' },
  progressBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
});
