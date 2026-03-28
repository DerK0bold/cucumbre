import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView } from 'expo-camera';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { getTraceability, getBarcodeFromLot, TraceabilityData, calculateTrustScore } from '../../services/traceabilityService';
import { analyzeProductImage, checkProductSafety, SafetyResult } from '../../services/aiAssistant';
import { addToPantry } from '../../services/pantryService';
import {
  fetchProductByBarcode, parseIngredientsList,
  getNutriScoreColor, getEcoScoreColor, OpenFoodFactsProduct,
} from '../../services/openFoodFacts';
import { addToHistory } from '../../services/scanHistory';
import { findIngredientOrigin } from '../../constants/ingredientOrigins';
import { checkProductForRecall, RecallEntry } from '../../services/recallDatabase';
import { calculateCarbonFootprint, CarbonResult } from '../../services/carbonFootprint';
import { predictShelfLife, ShelfLifeResult } from '../../services/shelfLife';
import { recordProductScan } from '../../services/gamification';
import { WarningBanner } from '../../components/organisms/WarningBanner';
import { BatchCameraModal } from '../../components/organisms/BatchCameraModal';
import { JourneyTimeline } from '../../components/organisms/JourneyTimeline';
import { ScoreCard } from '../../components/molecules/ScoreCard';
import { IngredientCard } from '../../components/molecules/IngredientCard';
import { NutritionItem } from '../../components/atoms/NutritionItem';
import styles from '../../styles/product.styles';

function getPriceBreakdown(categories: string): { label: string; pct: number; color: string }[] {
  const cat = categories.toLowerCase();
  if (cat.includes('chocolate') || cat.includes('confectionery') || cat.includes('süssware')) {
    return [
      { label: 'Rohstoffe & Bauern', pct: 18, color: '#4ADE80' },
      { label: 'Verarbeitung', pct: 32, color: '#60A5FA' },
      { label: 'Verpackung', pct: 9, color: '#F59E0B' },
      { label: 'Transport', pct: 13, color: '#A78BFA' },
      { label: 'Handel & Marketing', pct: 23, color: '#FB923C' },
      { label: 'Steuern (MwSt.)', pct: 5, color: '#F87171' },
    ];
  }
  if (cat.includes('dairy') || cat.includes('milch') || cat.includes('cheese') || cat.includes('käse')) {
    return [
      { label: 'Rohstoffe & Bauern', pct: 32, color: '#4ADE80' },
      { label: 'Verarbeitung', pct: 24, color: '#60A5FA' },
      { label: 'Verpackung', pct: 8, color: '#F59E0B' },
      { label: 'Transport', pct: 10, color: '#A78BFA' },
      { label: 'Handel & Marketing', pct: 21, color: '#FB923C' },
      { label: 'Steuern (MwSt.)', pct: 5, color: '#F87171' },
    ];
  }
  if (cat.includes('beverage') || cat.includes('getränk')) {
    return [
      { label: 'Rohstoffe & Bauern', pct: 12, color: '#4ADE80' },
      { label: 'Verarbeitung', pct: 20, color: '#60A5FA' },
      { label: 'Verpackung', pct: 18, color: '#F59E0B' },
      { label: 'Transport', pct: 16, color: '#A78BFA' },
      { label: 'Handel & Marketing', pct: 29, color: '#FB923C' },
      { label: 'Steuern (MwSt.)', pct: 5, color: '#F87171' },
    ];
  }
  return [
    { label: 'Rohstoffe & Bauern', pct: 22, color: '#4ADE80' },
    { label: 'Verarbeitung', pct: 28, color: '#60A5FA' },
    { label: 'Verpackung', pct: 8, color: '#F59E0B' },
    { label: 'Transport', pct: 13, color: '#A78BFA' },
    { label: 'Handel & Marketing', pct: 24, color: '#FB923C' },
    { label: 'Steuern (MwSt.)', pct: 5, color: '#F87171' },
  ];
}

export default function ProductScreen() {
  const { barcode: id, isLot, ean } = useLocalSearchParams<{ barcode: string; isLot?: string; ean?: string }>();
  const barcode = isLot === 'true' ? ean || getBarcodeFromLot(id) || id : id;
  const lotNumber = isLot === 'true' ? id : undefined;
  const router = useRouter();

  const [product, setProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [recall, setRecall] = useState<RecallEntry | null>(null);
  const [carbon, setCarbon] = useState<CarbonResult | null>(null);
  const [shelfLife, setShelfLife] = useState<ShelfLifeResult | null>(null);
  const [aiSafety, setAiSafety] = useState<SafetyResult | null>(null);
  const [showBatchCamera, setShowBatchCamera] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [traceability, setTraceability] = useState<TraceabilityData | null>(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const productName = product?.product_name_de || product?.product_name || 'Unbekanntes Produkt';

  const normalizeLot = (value?: string): string | null => {
    if (!value) return null;
    const normalized = value.toUpperCase().replace(/^LOT[:\-\s]*/i, '').replace(/[^A-Z0-9-]/g, '').trim();
    return normalized.length >= 4 ? normalized : null;
  };

  const extractLotFromText = (value?: string): string | null => {
    if (!value) return null;
    for (const pattern of [/(?:LOT|BATCH|CHARGE)\s*[:#-]?\s*([A-Z0-9-]{4,})/i, /\b(L[0-9]{6,}[A-Z0-9-]*)\b/i]) {
      const match = value.match(pattern);
      if (match?.[1]) return normalizeLot(match[1]);
    }
    return null;
  };

  useEffect(() => {
    if (barcode) loadProduct(barcode);
    if (lotNumber) setTraceability(getTraceability(lotNumber));
  }, [barcode, lotNumber]);

  const handleBatchCapture = async () => {
    if (!cameraRef.current || ocrLoading) return;
    try {
      setOcrLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      if (!photo?.base64) return;

      const ocrResult = await analyzeProductImage(photo.base64, product?.brands, productName);
      const ocrDetectedLot = normalizeLot(ocrResult.lotNumber) || extractLotFromText(ocrResult.description) || null;
      let detectedLot: string | null = ocrDetectedLot || lotNumber || null;
      let mockData = detectedLot ? getTraceability(detectedLot) : null;

      const lowerName = productName.toLowerCase();
      if (!mockData && (lowerName.includes('ginger') || lowerName.includes('ingwer'))) { detectedLot = 'L2590069'; mockData = getTraceability(detectedLot); }
      else if (!mockData && (lowerName.includes('mint') || lowerName.includes('minze'))) { detectedLot = 'L2590059'; mockData = getTraceability(detectedLot); }
      else if (!mockData && (lowerName.includes('toblerone') || lowerName.includes('chocolate') || lowerName.includes('schokolade'))) { detectedLot = 'L2506032'; mockData = getTraceability(detectedLot); }
      else if (!mockData) { detectedLot = 'L-TONY-24-001'; mockData = getTraceability(detectedLot); }

      if (mockData) {
        setTraceability(mockData);
        setShowBatchCamera(false);
        if (ocrDetectedLot && ocrDetectedLot !== mockData.lotNumber) {
          Alert.alert('Hinweis', `Charge ${ocrDetectedLot} wurde gelesen, ist aber nicht in den lokalen Demo-Daten. Wir zeigen stattdessen eine passende Beispiel-Charge (${mockData.lotNumber}).`);
        }
      } else {
        Alert.alert('Nicht erkannt', 'Chargennummer konnte nicht sicher erkannt werden. Bitte Code klar und nah fotografieren.');
      }
    } catch (e) {
      Alert.alert('Fehler', 'Bei der Analyse des Fotos ist ein Fehler aufgetreten.');
    } finally {
      setOcrLoading(false);
    }
  };

  const loadProduct = async (code: string) => {
    setLoading(true);
    setError(null);
    const result = await fetchProductByBarcode(code);
    if (result.found && result.product) {
      const p = result.product;
      setProduct(p);
      await addToHistory(p);
      setRecall(checkProductForRecall(code, p.brands, p.product_name_de || p.product_name));
      const ingredients = parseIngredientsList(p);
      setCarbon(calculateCarbonFootprint(ingredients));
      setShelfLife(predictShelfLife(p));
      checkProductSafety(p.product_name_de || p.product_name || 'Produkt', p.brands, ingredients)
        .then(setAiSafety).catch(() => {});
      const uniqueCountries = new Set<string>();
      ingredients.forEach((ing) => {
        const origin = findIngredientOrigin(ing);
        if (origin) origin.countries.slice(0, 1).forEach((c) => uniqueCountries.add(c.name));
      });
      const newAchievements = await recordProductScan(p.nutriscore_grade, p.ecoscore_grade, uniqueCountries.size);
      if (newAchievements.length > 0) {
        Alert.alert('🏆 Achievement freigeschaltet!', newAchievements.map((a) => `${a.emoji} ${a.title}`).join('\n'));
      }
    } else {
      setError(result.error || 'Produkt nicht gefunden');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#006EB7" />
        <Text style={styles.loadingText}>Suche in Open Food Facts...</Text>
        <Text style={styles.loadingSubtext}>Barcode: {barcode}</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorTitle}>Produkt nicht gefunden</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorBarcode}>Barcode: {barcode}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadProduct(barcode!)}>
          <Text style={styles.retryText}>Erneut versuchen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ingredients = parseIngredientsList(product);
  const visibleIngredients = showAllIngredients ? ingredients : ingredients.slice(0, 8);
  const uniqueCountries = new Set<string>();
  ingredients.forEach(({ }) => {});
  ingredients.forEach((ing) => {
    const origin = findIngredientOrigin(ing);
    if (origin) origin.countries.slice(0, 1).forEach((c) => uniqueCountries.add(c.name));
  });
  const originTags = product.origins_tags?.map((tag) => tag.replace('en:', '').replace(/-/g, ' ')) || [];
  const priceBreakdown = getPriceBreakdown(product.categories || '');

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={!isMapInteracting}>

        {/* Warning Banners */}
        {recall && (
          <WarningBanner
            severity={recall.severity}
            icon={recall.severity === 'critical' ? '🚨' : '⚠️'}
            title={recall.severity === 'critical' ? 'RÜCKRUF – Nicht verzehren!' : 'WARNUNG'}
            subtitle={`Ref: ${recall.id} · ${recall.date}`}
            message={recall.reason}
            actionIcon="information-circle"
            action={recall.action}
            footer={`Behörde: ${recall.authority}`}
          />
        )}
        {aiSafety?.hasWarning && (
          <WarningBanner
            severity={aiSafety.severity}
            icon={aiSafety.type === 'allergy' ? '🥦' : '🛡️'}
            title="AI SICHERHEITS-CHECK"
            subtitle={aiSafety.title}
            message={aiSafety.message}
            style={{ borderColor: aiSafety.severity === 'critical' ? '#EF4444' : '#F59E0B' }}
          >
            <View style={styles.aiBadgeRow}>
              <Ionicons name="sparkles" size={12} color={aiSafety.severity === 'critical' ? '#EF4444' : '#F59E0B'} />
              <Text style={[styles.aiBadgeText, { color: aiSafety.severity === 'critical' ? '#EF4444' : '#F59E0B' }]}>
                Live-Analyse durch Gemini AI
              </Text>
            </View>
          </WarningBanner>
        )}
        {traceability?.coolingChainWarning && (
          <WarningBanner
            severity="warning"
            icon="🧊"
            title={traceability.coolingChainWarning.title}
            subtitle={`Batch: ${traceability.lotNumber} · ${traceability.coolingChainWarning.observedAt}`}
            message={traceability.coolingChainWarning.message}
            actionIcon="snow"
            action="Bitte Produkt vor dem Verzehr auf Geruch, Konsistenz und Mindesthaltbarkeit pruefen."
          />
        )}

        {/* Product Header */}
        <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
          {product.image_front_url ? (
            <Image source={{ uri: product.image_front_url }} style={styles.productImage} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📦</Text>
            </View>
          )}
          <Text style={styles.productName}>{productName}</Text>
          {product.brands && <Text style={styles.brand}>{product.brands}</Text>}
          {lotNumber
            ? <View style={styles.lotBadge}><Text style={styles.lotLabel}>Charge: {lotNumber}</Text></View>
            : <Text style={styles.barcode}>Barcode: {barcode}</Text>
          }
        </LinearGradient>

        {/* Scores Row */}
        <View style={styles.scoresRow}>
          {product.nutriscore_grade && (
            <ScoreCard grade={product.nutriscore_grade} label="Nutri-Score" color={getNutriScoreColor(product.nutriscore_grade)} />
          )}
          {traceability && product.ecoscore_grade && (
            <ScoreCard grade={product.ecoscore_grade} label="Eco-Score" color={getEcoScoreColor(product.ecoscore_grade)} />
          )}
          {traceability && carbon && (
            <ScoreCard grade={carbon.grade} label="CO₂-Score" color={carbon.gradeColor} />
          )}
          <ScoreCard
            grade={`${calculateTrustScore(traceability, priceBreakdown.length > 0)}%`}
            label="Vertrauen"
            color="#006EB7"
          />
        </View>

        {/* AI Assistant Button */}
        <TouchableOpacity
          style={styles.aiButtonContainer}
          onPress={() => router.push({
            pathname: '/productAi/[barcode]',
            params: {
              barcode: id, isLot, ean,
              name: productName, brand: product.brands,
              nutriscore: product.nutriscore_grade, ecoscore: product.ecoscore_grade,
              carbon: carbon?.totalCO2?.toString(), carbonGrade: carbon?.grade,
              origins: JSON.stringify(product.origins_tags || []),
              manufacturing: product.manufacturing_places,
            },
          })}
        >
          <LinearGradient colors={['#006EB7', '#004B87']} style={styles.aiButton}>
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.aiButtonText}>KI-Experten fragen</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Add to Pantry */}
        <TouchableOpacity
          style={styles.pantryButtonContainer}
          onPress={async () => {
            try {
              await addToPantry(barcode!, productName, product.brands, product.image_front_url, shelfLife?.days || 7);
              Alert.alert('📦 Erfolg', 'Produkt wurde deinem Vorratsschrank hinzugefügt.');
            } catch { Alert.alert('Fehler', 'Konnte Produkt nicht hinzufügen.'); }
          }}
        >
          <View style={styles.pantryButton}>
            <Ionicons name="archive-outline" size={20} color="#006EB7" />
            <Text style={styles.pantryButtonText}>In Vorratsschrank legen</Text>
          </View>
        </TouchableOpacity>

        {/* Origin Tags */}
        {traceability && originTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Produktherkunft</Text>
            <View style={styles.originTags}>
              {originTags.map((tag, i) => (
                <View key={i} style={styles.originTag}><Text style={styles.originTagText}>{tag}</Text></View>
              ))}
            </View>
          </View>
        )}
        {traceability && product.manufacturing_places && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏭 Hergestellt in</Text>
            <View style={styles.infoBox}>
              <Ionicons name="business-outline" size={18} color="#006EB7" />
              <Text style={styles.infoText}>{product.manufacturing_places}</Text>
            </View>
          </View>
        )}

        {/* Carbon Footprint */}
        {traceability && carbon && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>♻️ CO₂-Fussabdruck</Text>
            <View style={[styles.carbonCard, { borderColor: carbon.gradeColor }]}>
              <View style={styles.carbonHeader}>
                <View>
                  <Text style={[styles.carbonTotal, { color: carbon.gradeColor }]}>{carbon.totalCO2} g CO₂</Text>
                  <Text style={styles.carbonPer}>pro 100g Produkt</Text>
                </View>
                <View style={[styles.carbonGradeBadge, { backgroundColor: carbon.gradeColor + '22', borderColor: carbon.gradeColor }]}>
                  <Text style={[styles.carbonGradeText, { color: carbon.gradeColor }]}>{carbon.grade.toUpperCase()}</Text>
                  <Text style={[styles.carbonGradeLabel, { color: carbon.gradeColor }]}>{carbon.gradeLabel}</Text>
                </View>
              </View>
              {carbon.topContributors.length > 0 && (
                <View style={styles.carbonContributors}>
                  <Text style={styles.carbonContribTitle}>Grösste CO₂-Quellen:</Text>
                  {carbon.topContributors.map((c, i) => (
                    <View key={i} style={styles.carbonContribRow}>
                      <Text style={styles.carbonContribName}>{c.name}</Text>
                      <Text style={styles.carbonContribVal}>{c.co2}g</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Ingredients with Origins */}
        {traceability && ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌍 Herkunft der Zutaten</Text>
            <Text style={styles.sectionSubtitle}>Woher kommen die einzelnen Zutaten?</Text>
            {uniqueCountries.size > 0 && (
              <View style={styles.worldSummary}>
                <Text style={styles.worldSummaryText}>
                  Dieses Produkt enthält Zutaten aus mindestens{' '}
                  <Text style={styles.highlight}>{uniqueCountries.size} Ländern</Text>
                </Text>
              </View>
            )}
            {visibleIngredients.map((ingredient, i) => (
              <IngredientCard key={i} name={ingredient} origin={findIngredientOrigin(ingredient)} />
            ))}
            {ingredients.length > 8 && (
              <TouchableOpacity style={styles.showMoreBtn} onPress={() => setShowAllIngredients(!showAllIngredients)}>
                <Text style={styles.showMoreText}>
                  {showAllIngredients ? 'Weniger anzeigen' : `${ingredients.length - 8} weitere Zutaten anzeigen`}
                </Text>
                <Ionicons name={showAllIngredients ? 'chevron-up' : 'chevron-down'} size={16} color="#006EB7" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Shelf Life */}
        {traceability && shelfLife && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏱️ Haltbarkeit & Lagerung</Text>
            <View style={[styles.shelfCard, { borderColor: shelfLife.color }]}>
              <View style={styles.shelfRow}>
                <Text style={styles.shelfIcon}>{shelfLife.icon}</Text>
                <View style={styles.shelfInfo}>
                  <Text style={[styles.shelfDays, { color: shelfLife.color }]}>{shelfLife.label}</Text>
                  <Text style={styles.shelfLabel}>Geschätzte Haltbarkeit (ungeöffnet)</Text>
                </View>
              </View>
              <View style={styles.shelfTipRow}>
                <Ionicons name="bulb-outline" size={15} color="#F59E0B" />
                <Text style={styles.shelfTip}>{shelfLife.storageTip}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Nutrition */}
        {product.nutriments && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Nährwerte pro 100g</Text>
            <View style={styles.nutritionGrid}>
              {(() => {
                const kcal = product.nutriments?.['energy-kcal_100g'] || (product.nutriments?.energy_100g ? product.nutriments.energy_100g / 4.184 : 0);
                const kj = product.nutriments?.['energy-kj_100g'] || product.nutriments?.energy_100g || 0;
                if (!kcal && !kj) return null;
                return <NutritionItem label="Energie" value={`${kcal.toFixed(0)} / ${kj.toFixed(0)}`} unit=" kcal/kJ" />;
              })()}
              <NutritionItem label="Fett" value={product.nutriments.fat_100g?.toFixed(1)} unit="g" />
              <NutritionItem label="Zucker" value={product.nutriments.sugars_100g?.toFixed(1)} unit="g" />
              <NutritionItem label="Protein" value={product.nutriments.proteins_100g?.toFixed(1)} unit="g" />
              <NutritionItem label="Salz" value={product.nutriments.salt_100g?.toFixed(2)} unit="g" />
              <NutritionItem label="Ballaststoffe" value={product.nutriments.fiber_100g?.toFixed(1)} unit="g" />
            </View>
          </View>
        )}

        {/* Price Breakdown */}
        {traceability && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Preisaufschlüsselung</Text>
            <Text style={styles.sectionSubtitle}>So verteilt sich der Preis entlang der Lieferkette (simuliert)</Text>
            <View style={styles.priceCard}>
              <View style={styles.priceBarContainer}>
                {priceBreakdown.map((item, i) => (
                  <View key={i} style={[styles.priceBarSegment, { width: `${item.pct}%`, backgroundColor: item.color }]} />
                ))}
              </View>
              {priceBreakdown.map((item, i) => (
                <View key={i} style={styles.priceLegendRow}>
                  <View style={[styles.priceLegendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.priceLegendLabel}>{item.label}</Text>
                  <Text style={[styles.priceLegendPct, { color: item.color }]}>{item.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Product Journey */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Produkt-Reise (Traceability)</Text>
          {traceability ? (
            <>
              <JourneyTimeline
                steps={traceability.journey}
                lotNumber={traceability.lotNumber}
                onConfirm={() => Alert.alert('✅ Bestätigt', 'Vielen Dank! Du hast geholfen, die Datenqualität zu verbessern (+10 Punkte).')}
                onReport={() => Alert.alert('⚠️ Meldung', 'Vielen Dank für den Hinweis. Wir werden die Daten für diese Charge (L-TONY-24-001) prüfen.')}
                onRescan={() => setShowBatchCamera(true)}
              />
              {traceability.journey.some(s => s.coordinates) && (
                <View style={styles.mapWrapper}>
                  <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{ latitude: 30, longitude: 0, latitudeDelta: 100, longitudeDelta: 100 }}
                    scrollEnabled zoomEnabled rotateEnabled pitchEnabled
                    onTouchStart={() => setIsMapInteracting(true)}
                    onTouchEnd={() => setIsMapInteracting(false)}
                    onPanDrag={() => setIsMapInteracting(true)}
                    onRegionChangeComplete={() => setIsMapInteracting(false)}
                  >
                    {traceability.journey.filter(s => s.coordinates).map((s, idx) => (
                      <Marker key={idx} coordinate={s.coordinates!} title={s.event} description={s.location}>
                        <View style={styles.mapMarker}><Text style={styles.mapMarkerIcon}>{s.icon}</Text></View>
                      </Marker>
                    ))}
                    <Polyline
                      coordinates={traceability.journey.filter(s => s.coordinates).map(s => s.coordinates!)}
                      strokeColor="#7C3AED" strokeWidth={3} lineDashPattern={[5, 5]}
                    />
                  </MapView>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noJourneyCard}>
              <View style={styles.noJourneyIconBox}>
                <Ionicons name="location" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.noJourneyTitle}>Genaue Herkunft unbekannt</Text>
              <Text style={styles.noJourneyText}>Scanne die Batch-Nummer (oft am Boden oder Rand), um die exakte Reise dieses Produkts zu sehen.</Text>
              <TouchableOpacity style={styles.batchScanBtn} onPress={() => setShowBatchCamera(true)}>
                <LinearGradient colors={['#7C3AED', '#6D28D9']} style={styles.batchScanGradient}>
                  <Ionicons name="camera" size={20} color="#fff" />
                  <Text style={styles.batchScanText}>Batch-Nummer scannen</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <BatchCameraModal
        visible={showBatchCamera}
        cameraRef={cameraRef}
        loading={ocrLoading}
        onCapture={handleBatchCapture}
        onClose={() => setShowBatchCamera(false)}
      />
    </>
  );
}
