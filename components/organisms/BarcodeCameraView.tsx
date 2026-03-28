import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onBarcodeScanned: (data: string) => void;
  onClose: () => void;
}

export function BarcodeCameraView({ onBarcodeScanned, onClose }: Props) {
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={({ data }) => onBarcodeScanned(data)}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr', 'upc_a', 'upc_e'] }}
      />
      <View style={styles.overlay}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <Text style={styles.hint}>Barcode in den Rahmen halten</Text>
      </View>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close-circle" size={44} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  frame: { width: 260, height: 200, position: 'relative' },
  corner: { position: 'absolute', width: 34, height: 34, borderColor: '#7C3AED', borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  hint: {
    color: '#fff',
    marginTop: 24,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  closeBtn: { position: 'absolute', top: 60, right: 20 },
});
