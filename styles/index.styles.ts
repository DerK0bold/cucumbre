import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },

  // Hero
  hero: { alignItems: 'center', marginBottom: 20 },
  heroLogoWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  heroLogo: { width: 84, height: 84, borderRadius: 42 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },

  // Scan buttons
  scanButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 10, shadowColor: '#006EB7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  ocrButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 20, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  scanButtonGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 12,
  },
  scanButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  ocrBtnTextWrap: { flexDirection: 'column' },
  ocrBtnSub: { color: '#DDD6FE', fontSize: 11, marginTop: 1 },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { color: '#64748B', marginHorizontal: 12, fontSize: 13 },

  // Manual input
  manualInput: { marginBottom: 24, width: '100%' },

  // Demo
  demoTitle: {
    color: '#64748B', fontSize: 12, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },
  demoGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    alignContent: 'flex-start',
  },
  demoItem: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 8,
    alignItems: 'center',
    width: '30%', flexGrow: 1,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  demoEmoji: { fontSize: 28, marginBottom: 6 },
  demoName: { color: '#1E293B', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 16, color: '#64748B', fontSize: 16 },

  // Camera (shared)
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },

  // Barcode scan frame
  scanFrame: { width: 260, height: 200, position: 'relative' },

  // OCR frame (taller for label/packaging)
  ocrFrame: { width: 280, height: 340, position: 'relative' },

  corner: { position: 'absolute', width: 34, height: 34, borderColor: '#7C3AED', borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  scanHint: {
    color: '#fff', marginTop: 24, fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
  },
  closeCameraBtn: { position: 'absolute', top: 60, right: 20 },

  // OCR capture button
  captureBtn: {
    marginTop: 32,
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtnDisabled: {
    opacity: 0.8,
  },
  captureBtnInner: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#fff',
  },

  // OCR loading overlay
  ocrLoadingBox: { alignItems: 'center', gap: 16 },
  ocrLoadingText: {
    color: '#fff', fontSize: 16, fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
  },
  ocrProcessingScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  ocrProcessingText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
