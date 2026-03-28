import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrackingEvent } from '../../services/orderTracking';

interface Props {
  event: TrackingEvent;
  isLast: boolean;
}

export function TrackingTimelineItem({ event, isLast }: Props) {
  const isCompleted = event.status === 'completed';
  const isActive = event.status === 'active';
  const isPending = event.status === 'pending';

  return (
    <View style={styles.item}>
      <View style={styles.left}>
        <View style={[styles.dot, isCompleted && styles.dotCompleted, isActive && styles.dotActive, isPending && styles.dotPending]}>
          {isCompleted && <Ionicons name="checkmark" size={12} color="#fff" />}
          {isActive && <View style={styles.dotInner} />}
        </View>
        {!isLast && <View style={[styles.line, (isCompleted || isActive) && styles.lineCompleted]} />}
      </View>
      <View style={[styles.content, isPending && styles.contentPending]}>
        <View style={styles.row}>
          <Text style={styles.eventIcon}>{event.icon}</Text>
          <View style={styles.textArea}>
            <Text style={[styles.title, isPending && styles.textPending, isActive && styles.textActive]}>
              {event.title}
            </Text>
            <Text style={[styles.desc, isPending && styles.textPending]}>{event.description}</Text>
            {event.temperature !== undefined && (
              <View style={styles.iotBadge}>
                <Ionicons name="thermometer" size={10} color={event.temperature > 8 ? '#EF4444' : '#10B981'} />
                <Text style={[styles.iotText, event.temperature > 8 && { color: '#EF4444' }]}>
                  {event.temperature}°C
                </Text>
                {event.humidity !== undefined && (
                  <>
                    <View style={styles.iotDivider} />
                    <Ionicons name="water" size={10} color="#006EB7" />
                    <Text style={styles.iotText}>{event.humidity}% rH</Text>
                  </>
                )}
              </View>
            )}
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={isPending ? '#4B5563' : '#6B7280'} />
              <Text style={[styles.location, isPending && styles.textPending]}>{event.location}</Text>
            </View>
            <Text style={[styles.timestamp, isPending && styles.textPending]}>{event.timestamp}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: 12 },
  left: { alignItems: 'center', width: 28 },
  dot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#CBD5E1', zIndex: 1,
  },
  dotCompleted: { backgroundColor: '#006EB7', borderColor: '#006EB7' },
  dotActive: { backgroundColor: '#FFFFFF', borderColor: '#006EB7' },
  dotPending: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  dotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#006EB7' },
  line: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 2 },
  lineCompleted: { backgroundColor: '#006EB7' },
  content: { flex: 1, paddingBottom: 20 },
  contentPending: { opacity: 0.5 },
  row: { flexDirection: 'row', gap: 10 },
  eventIcon: { fontSize: 22, marginTop: 2 },
  textArea: { flex: 1 },
  title: { color: '#1E293B', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  textPending: { color: '#94A3B8' },
  textActive: { color: '#006EB7' },
  desc: { color: '#64748B', fontSize: 13, lineHeight: 18, marginBottom: 4 },
  iotBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, marginTop: 4, marginBottom: 6, alignSelf: 'flex-start', gap: 4,
  },
  iotText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  iotDivider: { width: 1, height: 8, backgroundColor: '#CBD5E1', marginHorizontal: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 },
  location: { color: '#94A3B8', fontSize: 12 },
  timestamp: { color: '#94A3B8', fontSize: 11 },
});
