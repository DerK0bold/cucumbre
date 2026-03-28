import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { analyzeProductImage } from '../../services/aiAssistant';
import { searchProductsByName } from '../../services/openFoodFacts';
import { BarcodeCameraView } from '../../components/organisms/BarcodeCameraView';
import { OcrCameraView } from '../../components/organisms/OcrCameraView';
import { SearchInput } from '../../components/molecules/SearchInput';
import { LoadingOverlay } from '../../components/atoms/LoadingOverlay';
import styles from '../../styles/index.styles';

const DEMO_BARCODES = [
  { name: 'Toblerone', barcode: '7612100040789', emoji: '🍫' },
  { name: 'Ovomaltine', barcode: '7610200050505', emoji: '🥤' },
  { name: 'Granola', barcode: '7613037897478', emoji: '🥣' },
  { name: 'Lindt 70%', barcode: '3046920022981', emoji: '🍫' },
  { name: 'Nutella', barcode: '3017620422003', emoji: '🫙' },
  { name: 'Ricola', barcode: '7610818001037', emoji: '🌿' },
];

function normalizeBarcode(value?: string): string | undefined {
  if (!value) return undefined;
  const compact = value.replace(/\s+/g, '');
  const exactDigits = compact.match(/\b\d{8,14}\b/);
  if (exactDigits) return exactDigits[0];
  const cleanedDigits = compact.replace(/\D/g, '');
  return cleanedDigits.length >= 8 && cleanedDigits.length <= 14 ? cleanedDigits : undefined;
}

function normalizeLot(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/\s+/g, '').trim();
  return normalized.length >= 3 ? normalized : undefined;
}

function buildSearchCandidates(name?: string, brand?: string): string[] {
  const candidates = new Set<string>();
  const clean = (v?: string) => (v || '').replace(/[|:;,_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanName = clean(name);
  const cleanBrand = clean(brand);
  if (cleanName) candidates.add(cleanName);
  if (cleanBrand && cleanName) candidates.add(`${cleanBrand} ${cleanName}`);
  if (cleanName) {
    const words = cleanName.split(' ').filter(Boolean);
    if (words.length > 2) {
      candidates.add(words.slice(0, 2).join(' '));
      candidates.add(words.slice(0, 3).join(' '));
    }
  }
  return Array.from(candidates).filter((c) => c.length >= 3).slice(0, 4);
}

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [manualBarcode, setManualBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showOcrCamera, setShowOcrCamera] = useState(false);
  const [ocrCapturing, setOcrCapturing] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const scannedRef = useRef(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  const ensurePermission = async (): Promise<boolean> => {
    if (permission?.granted) return true;
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert('Kamera Zugriff', 'Bitte erlaube den Kamera-Zugriff in den Einstellungen.');
      return false;
    }
    return true;
  };

  const handleBarcode = (id: string) => {
    if (loading) return;
    setLoading(true);
    setShowCamera(false);
    scannedRef.current = false;
    const isLot = isNaN(Number(id)) || id.toUpperCase().startsWith('L') || id.toUpperCase().startsWith('BATCH');
    router.push(`/product/${id}?isLot=${isLot}`);
    setLoading(false);
  };

  const handleBarcodeScanned = (data: string) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    handleBarcode(data);
  };

  const handleManualSearch = () => {
    const trimmed = manualBarcode.trim();
    if (!trimmed) return;
    if (trimmed.length < 3) { Alert.alert('Eingabe zu kurz', 'Bitte mindestens 3 Zeichen eingeben.'); return; }
    handleBarcode(trimmed);
    setManualBarcode('');
  };

  const handleOcrCapture = async () => {
    if (ocrLoading || ocrCapturing || !cameraRef.current) return;
    try {
      setOcrLoading(true);
      setOcrCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.4 });
      setOcrCapturing(false);
      
      if (!photo?.base64) { 
        setOcrLoading(false);
        Alert.alert('Fehler', 'Foto konnte nicht aufgenommen werden.'); 
        return; 
      }

      const result = await analyzeProductImage(photo.base64);
      const barcode = normalizeBarcode(result.barcode);
      const lotNumber = normalizeLot(result.lotNumber);

      if (barcode) { setShowOcrCamera(false); router.push(`/product/${barcode}`); return; }
      if (lotNumber) { setShowOcrCamera(false); router.push(`/product/${lotNumber}?isLot=true&ean=${barcode || ''}`); return; }

      if (result.productName) {
        for (const candidate of buildSearchCandidates(result.productName, result.brand)) {
          const searchResult = await searchProductsByName(candidate);
          if (searchResult.found && searchResult.product?.code) {
            setShowOcrCamera(false);
            router.push(`/product/${searchResult.product.code}`);
            return;
          }
        }
        setShowOcrCamera(false);
        Alert.alert(
          `Produkt erkannt: ${result.productName}`,
          result.brand
            ? `Marke: ${result.brand}\n\n${result.description ?? ''}\n\nKein Barcode gefunden - gib die Nummer manuell ein.`
            : `${result.description ?? ''}\n\nKein Barcode gefunden - gib die Nummer manuell ein.`,
          [{ text: 'OK' }]
        );
        return;
      }
      setShowOcrCamera(false);
      Alert.alert('Nichts erkannt', 'Halte die Kamera näher an das Produkt und versuche es erneut.');
    } catch (err: unknown) {
      Alert.alert('Fehler', err instanceof Error ? err.message : 'OCR-Analyse fehlgeschlagen.');
    } finally {
      setOcrCapturing(false);
      setOcrLoading(false);
    }
  };

  if (showOcrCamera && permission?.granted) {
    return (
      <OcrCameraView
        cameraRef={cameraRef}
        isCapturing={ocrCapturing}
        isProcessing={ocrLoading}
        onCapture={handleOcrCapture}
        onClose={() => setShowOcrCamera(false)}
      />
    );
  }

  if (showCamera && permission?.granted) {
    return (
      <BarcodeCameraView
        onBarcodeScanned={handleBarcodeScanned}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Lade Produktdaten..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroLogoWrap}>
          <Image source={require('../../RootRouteIcon.png')} style={styles.heroLogo} resizeMode="contain" />
        </View>
        <Text style={styles.heroTitle}>Wo kommt dein Essen her?</Text>
        <Text style={styles.heroSubtitle}>
          Scanne die Produktionsnummer (Charge) am Boden der Dose oder den Barcode.
        </Text>
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={async () => { if (await ensurePermission()) { scannedRef.current = false; setShowCamera(true); } }} activeOpacity={0.85}>
        <LinearGradient colors={['#006EB7', '#004B87']} style={styles.scanButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Ionicons name="barcode-outline" size={30} color="#fff" />
          <Text style={styles.scanButtonText}>Produktions-Code scannen</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.ocrButton} onPress={async () => { if (await ensurePermission()) setShowOcrCamera(true); }} activeOpacity={0.85}>
        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.scanButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Ionicons name="camera-outline" size={28} color="#fff" />
          <View style={styles.ocrBtnTextWrap}>
            <Text style={styles.scanButtonText}>Foto / OCR scannen</Text>
            <Text style={styles.ocrBtnSub}>KI erkennt Produkt automatisch</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>oder manuell eingeben</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.manualInput}>
        <SearchInput
          value={manualBarcode}
          onChangeText={setManualBarcode}
          placeholder="Produktionsnummer (z.B. L1234)..."
          onSubmit={handleManualSearch}
          autoCapitalize="characters"
        />
      </View>

      <Text style={styles.demoTitle}>Demo-Produkte</Text>
      <View style={styles.demoGrid}>
        {DEMO_BARCODES.map((item) => (
          <TouchableOpacity key={item.barcode} style={styles.demoItem} onPress={() => handleBarcode(item.barcode)} activeOpacity={0.7}>
            <Text style={styles.demoEmoji}>{item.emoji}</Text>
            <Text style={styles.demoName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
