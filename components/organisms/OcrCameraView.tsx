import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { RefObject } from 'react';
import { LoadingOverlay } from '../atoms/LoadingOverlay';

interface Props {
  cameraRef: RefObject<CameraView>;
  isCapturing: boolean;
  isProcessing: boolean;
  onCapture: () => void;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export function OcrCameraView({ cameraRef, isCapturing, isProcessing, onCapture, onClose }: Props) {
  return (
    <View style={styles.container}>
      {isProcessing ? (
        <LoadingOverlay message="KI analysiert dein Foto & erkennt Batch..." />
      ) : (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          
          <View style={styles.overlay}>
            {/* Oben: Schließen Button */}
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <View style={styles.closeBtnInner}>
                <Ionicons name="close" size={24} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Mitte: Scan-Rahmen */}
            <View style={styles.frameContainer}>
              <View style={styles.frame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                
                {/* Animierte Scan-Linie (statisch angedeutet) */}
                <View style={styles.scanLine} />
              </View>
              <View style={styles.hintContainer}>
                <Text style={styles.hint}>Produkt-Label in den Rahmen halten</Text>
              </View>
            </View>

            {/* Unten: Capture-Button */}
            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={[styles.captureBtn, isCapturing && styles.captureBtnDisabled]}
                onPress={onCapture}
                activeOpacity={0.8}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <View style={styles.captureBtnOuter}>
                    <View style={styles.captureBtnInnerCircle} />
                    <Ionicons name="scan" size={24} color="#fff" style={styles.innerIcon} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.captureHint}>Tippen zum Scannen</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 50,
  },
  
  // Schließen Button
  closeBtn: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 10,
  },
  closeBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Scan-Rahmen
  frameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: { 
    width: width * 0.75, 
    height: width * 0.9, 
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#7C3AED', borderWidth: 4 },
  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 18 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 18 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 18 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 18 },
  
  scanLine: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '50%',
    height: 2,
    backgroundColor: 'rgba(124, 58, 237, 0.5)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },

  hintContainer: {
    marginTop: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  hint: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Bottom Controls
  bottomControls: {
    alignItems: 'center',
    marginBottom: 20,
  },
  captureBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    padding: 6,
  },
  captureBtnOuter: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  captureBtnInnerCircle: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#7C3AED',
    opacity: 0.1,
    borderRadius: 35,
  },
  innerIcon: {
    color: '#7C3AED',
  },
  captureBtnDisabled: { opacity: 0.6 },
  captureHint: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
});
