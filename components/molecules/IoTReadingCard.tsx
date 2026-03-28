import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  icon: string;
  location: string;
  time: string;
  humidity?: number;
  temp: number;
  targetMin: number;
  targetMax: number;
  ok: boolean;
}

export function IoTReadingCard({ icon, location, time, humidity, temp, targetMin, targetMax, ok }: Props) {
  return (
    <View style={[styles.card, ok ? styles.ok : styles.alert]}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <View>
          <Text style={styles.location}>{location}</Text>
          <Text style={styles.time}>{time}</Text>
          {humidity !== undefined && (
            <View style={styles.humidityRow}>
              <Ionicons name="water-outline" size={10} color="#64748B" />
              <Text style={styles.humidityText}>{humidity}% rH</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.temp, { color: ok ? '#10B981' : '#EF4444' }]}>{temp}°C</Text>
        <Text style={styles.target}>Ziel: {targetMin}–{targetMax}°C</Text>
        <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeAlert]}>
          <Text style={[styles.badgeText, { color: ok ? '#10B981' : '#EF4444' }]}>
            {ok ? '✓ OK' : '⚠ Alarm'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ok: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  alert: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  icon: { fontSize: 22 },
  location: { color: '#1E293B', fontSize: 13, fontWeight: '600' },
  time: { color: '#64748B', fontSize: 11, marginTop: 2 },
  humidityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  humidityText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  right: { alignItems: 'flex-end', gap: 4 },
  temp: { fontSize: 20, fontWeight: '800' },
  target: { color: '#64748B', fontSize: 11 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  badgeOk: { borderColor: '#10B981', backgroundColor: '#DCFCE7' },
  badgeAlert: { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
