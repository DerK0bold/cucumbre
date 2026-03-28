import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScanHistoryItem } from '../../services/scanHistory';
import { getNutriScoreColor, getEcoScoreColor } from '../../services/openFoodFacts';
import { ScoreBadge } from '../atoms/ScoreBadge';

interface Props {
  item: ScanHistoryItem;
  formattedTime: string;
  onPress: () => void;
}

export function ProductHistoryCard({ item, formattedTime, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>📦</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{item.productName}</Text>
        {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
        <Text style={styles.time}>{formattedTime}</Text>
        <View style={styles.badges}>
          {item.nutriscore && (
            <ScoreBadge
              label={item.nutriscore.toUpperCase()}
              color={getNutriScoreColor(item.nutriscore)}
            />
          )}
          {item.ecoscore && (
            <ScoreBadge
              label={`Eco ${item.ecoscore.toUpperCase()}`}
              color={getEcoScoreColor(item.ecoscore)}
            />
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#4B5563" style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
  },
  image: { width: 64, height: 64, borderRadius: 10 },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: { fontSize: 24 },
  content: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  brand: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  time: { fontSize: 11, color: '#94A3B8', marginBottom: 6 },
  badges: { flexDirection: 'row', gap: 6 },
  chevron: { marginLeft: 8 },
});
