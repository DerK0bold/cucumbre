import { View, Text, TouchableOpacity, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { RefObject } from 'react';

interface Props {
  visible: boolean;
  cameraRef: RefObject<CameraView>;
  loading: boolean;
  onCapture: () => void;
  onClose: () => void;
}

export function BatchCameraModal({ visible, cameraRef, loading, onCapture, onClose }: Props) {
  return (
    <Modal animationType="slide" transparent={false} visible={visible}>
      <View style={styles.container}>
        <CameraView style={styles.camera} ref={cameraRef} />
        <View style={styles.overlay}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instruction}>Vorderseite oder Boden mit Batch/Lot-Code scannen</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close-circle" size={44} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={onCapture} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <View style={styles.captureBtnOuter}>
                  <View style={styles.captureBtnInner} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
  },
  frame: { width: 280, height: 180, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#7C3AED', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  instruction: {
    color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center',
    marginTop: 40, paddingHorizontal: 40,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4,
  },
  buttons: {
    position: 'absolute', bottom: 60, width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
  },
  closeBtn: { padding: 10 },
  captureBtn: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  captureBtnOuter: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
});
