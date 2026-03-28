import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IngredientOrigin } from '../../constants/ingredientOrigins';

const BAR_COLORS = ['#4ADE80', '#60A5FA', '#F59E0B'];

interface Props {
  name: string;
  origin?: IngredientOrigin | null;
}

export function IngredientCard({ name, origin }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {origin && <Text style={styles.nameDE}>{origin.nameDE}</Text>}
      </View>
      {origin ? (
        <>
          <Text style={styles.description}>{origin.description}</Text>
          <View style={styles.countryList}>
            {origin.countries.slice(0, 3).map((country, i) => (
              <View key={i} style={styles.countryRow}>
                <Text style={styles.flag}>{country.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={styles.countryName}>{country.name}</Text>
                  <Text style={styles.region}>{country.region}</Text>
                </View>
                <View style={styles.percentBar}>
                  <View style={[styles.percentFill, { width: `${country.percentage}%`, backgroundColor: BAR_COLORS[i % 3] }]} />
                </View>
                <Text style={styles.percentage}>{country.percentage}%</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.noOriginRow}>
          <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.noOriginText}>Herkunft nicht bekannt</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  name: { color: '#1E293B', fontSize: 15, fontWeight: '700', flex: 1 },
  nameDE: { color: '#006EB7', fontSize: 12, fontWeight: '600' },
  description: { color: '#64748B', fontSize: 12, marginBottom: 10, lineHeight: 18 },
  countryList: { gap: 8 },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flag: { fontSize: 20 },
  countryInfo: { width: 120 },
  countryName: { color: '#334155', fontSize: 13, fontWeight: '600' },
  region: { color: '#64748B', fontSize: 11 },
  percentBar: { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  percentFill: { height: '100%', borderRadius: 3 },
  percentage: { color: '#64748B', fontSize: 12, width: 35, textAlign: 'right' },
  noOriginRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noOriginText: { color: '#64748B', fontSize: 13 },
});
