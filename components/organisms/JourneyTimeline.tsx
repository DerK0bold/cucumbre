import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface TraceabilityStep {
  icon: string;
  event: string;
  location: string;
  date: string;
  coordinates?: { latitude: number; longitude: number };
}

interface Props {
  steps: TraceabilityStep[];
  lotNumber: string;
  onConfirm: () => void;
  onReport: () => void;
  onRescan: () => void;
}

export function JourneyTimeline({ steps, lotNumber, onConfirm, onReport, onRescan }: Props) {
  return (
    <View style={styles.journeyCard}>
      <View style={styles.journeyHeader}>
        <View>
          <Text style={styles.journeyLotTitle}>Charge / Batch</Text>
          <Text style={styles.journeyLotValue}>{lotNumber}</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-sharp" size={14} color="#059669" />
          <Text style={styles.verifiedText}>Verifiziert</Text>
        </View>
      </View>
      <View style={styles.timeline}>
        {steps.map((step, i) => (
          <View key={i} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={styles.timelinePoint}>
                <Text style={styles.timelineIcon}>{step.icon}</Text>
              </View>
              {i < steps.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineRight}>
              <Text style={styles.timelineEvent}>{step.event}</Text>
              <Text style={styles.timelineLocation}>{step.location}</Text>
              <Text style={styles.timelineStepDate}>{step.date}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.crowdInteraction}>
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
          <Text style={styles.confirmText}>Daten bestätigen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportBtn} onPress={onReport}>
          <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
          <Text style={styles.reportText}>Problem melden</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.rescanBatchBtn} onPress={onRescan}>
        <Text style={styles.rescanBatchText}>Andere Charge prüfen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  journeyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#DDD6FE',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  journeyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12,
  },
  journeyLotTitle: { fontSize: 11, color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' },
  journeyLotValue: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  verifiedText: { color: '#059669', fontSize: 12, fontWeight: '700' },
  timeline: { paddingLeft: 8 },
  timelineItem: { flexDirection: 'row', minHeight: 70 },
  timelineLeft: { width: 40, alignItems: 'center' },
  timelinePoint: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center', zIndex: 1, borderWidth: 2, borderColor: '#DDD6FE',
  },
  timelineIcon: { fontSize: 16 },
  timelineLine: { position: 'absolute', top: 32, bottom: 0, width: 2, backgroundColor: '#DDD6FE' },
  timelineRight: { flex: 1, paddingLeft: 12, paddingBottom: 20 },
  timelineEvent: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  timelineLocation: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  timelineStepDate: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  crowdInteraction: { flexDirection: 'row', gap: 10, marginTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  confirmBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#ECFDF5', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#10B981',
  },
  confirmText: { color: '#059669', fontSize: 13, fontWeight: '700' },
  reportBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#EF4444',
  },
  reportText: { color: '#B91C1C', fontSize: 13, fontWeight: '700' },
  rescanBatchBtn: { alignSelf: 'center', marginTop: 10, padding: 8 },
  rescanBatchText: { color: '#7C3AED', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
});
