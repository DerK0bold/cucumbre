import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getNutriScoreColor, getEcoScoreColor } from '../../services/openFoodFacts';

interface Props {
  name?: string;
  brand?: string;
  image?: string;
  nutriscore?: string;
  ecoscore?: string;
  carbon?: string;
  carbonGrade?: string;
  barcode?: string;
  lotNumber?: string;
  paddingTop: number;
  onBack: () => void;
  onClear: () => void;
}

export function ProductAiHeader({
  name, brand, image, nutriscore, ecoscore, carbon, carbonGrade,
  barcode, lotNumber, paddingTop, onBack, onClear,
}: Props) {
  return (
    <LinearGradient
      colors={['#006EB7', '#004C89']}
      style={[styles.header, { paddingTop: paddingTop }]}
    >
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onBack} style={styles.btn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.productMain}>
          {image ? (
            <Image source={{ uri: image }} style={styles.productImage} resizeMode="contain" />
          ) : (
            <View style={[styles.productImage, styles.imagePlaceholder]}>
              <Text style={{ fontSize: 16 }}>📦</Text>
            </View>
          )}
          <View style={styles.textWrap}>
            <Text style={styles.title} numberOfLines={1}>{name || 'KI-Assistent'}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{brand || 'Produkt-Analyse'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClear} style={styles.btn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="trash-outline" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      <View style={styles.scores}>
        {nutriscore && (
          <View style={[styles.scoreBadge, { backgroundColor: getNutriScoreColor(nutriscore) }]}>
            <Text style={styles.scoreLabel}>Nutri-Score</Text>
            <Text style={styles.scoreValue}>{nutriscore.toUpperCase()}</Text>
          </View>
        )}
        {ecoscore && (
          <View style={[styles.scoreBadge, { backgroundColor: getEcoScoreColor(ecoscore) }]}>
            <Text style={styles.scoreLabel}>Eco-Score</Text>
            <Text style={styles.scoreValue}>{ecoscore.toUpperCase()}</Text>
          </View>
        )}
        {carbon && (
          <View style={[styles.scoreBadge, { backgroundColor: getEcoScoreColor(carbonGrade || 'c') }]}>
            <Text style={styles.scoreLabel}>CO₂-Score</Text>
            <Text style={styles.scoreValue}>{carbonGrade?.toUpperCase() || 'C'}</Text>
          </View>
        )}
        {lotNumber ? (
          <View style={[styles.scoreBadge, { backgroundColor: '#7C3AED', borderWidth: 1, borderColor: '#DDD6FE' }]}>
            <Text style={styles.scoreLabel}>Lot / Charge</Text>
            <Text style={styles.scoreValue}>{lotNumber}</Text>
          </View>
        ) : barcode ? (
          <View style={[styles.scoreBadge, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
            <Text style={styles.scoreLabel}>EAN / GTIN</Text>
            <Text style={styles.scoreValue}>{barcode.slice(-4)}</Text>
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#004B87' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  btn: { padding: 4 },
  productMain: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginHorizontal: 12 },
  productImage: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  imagePlaceholder: { backgroundColor: 'rgba(255,255,255,0.2)' },
  textWrap: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  scores: { flexDirection: 'row', gap: 8 },
  scoreBadge: { flexDirection: 'column', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, minWidth: 70, alignItems: 'center' },
  scoreLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  scoreValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
