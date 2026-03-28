import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface LoadingOverlayProps {
  message?: string;
}

const { width } = Dimensions.get('window');

/**
 * Ein premium-aussehender Loading-Overlay für die App.
 * Verwendet Unschärfe und Verläufe für ein modernes Design.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'KI analysiert dein Foto...' 
}) => {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Weißer Hintergrund für klaren Look */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />
      
      <View style={styles.content}>
        {/* Subtiler Hintergrund-Verlauf */}
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.05)', 'rgba(0, 110, 183, 0.05)']}
          style={styles.gradientBg}
        />
        
        <View style={styles.iconContainer}>
          <View style={styles.spinnerWrapper}>
            <ActivityIndicator size="large" color="#006EB7" />
          </View>
          
          <View style={styles.sparkle1}>
            <Ionicons name="sparkles" size={24} color="#7C3AED" />
          </View>
          <View style={styles.sparkle2}>
            <Ionicons name="scan" size={20} color="#006EB7" />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Bitte warten</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        
        <View style={styles.progressTrack}>
           <View style={styles.progressFill} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  spinnerWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sparkle1: {
    position: 'absolute',
    top: -10,
    right: -10,
    opacity: 0.8,
  },
  sparkle2: {
    position: 'absolute',
    bottom: -5,
    left: -15,
    opacity: 0.6,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#1E293B',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  message: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressTrack: {
    width: width * 0.6,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginTop: 40,
    overflow: 'hidden',
  },
  progressFill: {
    width: '40%', // Simulierter Fortschritt
    height: '100%',
    backgroundColor: '#006EB7',
    borderRadius: 3,
  }
});
