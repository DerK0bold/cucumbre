import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getOrCreateOrder, Order, TrackingEvent } from '../../services/orderTracking';
import { scheduleDeliveryNotifications } from '../../services/notifications';
import { TrackingTimelineItem } from '../../components/molecules/TrackingTimelineItem';
import { IoTReadingCard } from '../../components/molecules/IoTReadingCard';
import { SupplyChainRow } from '../../components/organisms/SupplyChainRow';
import styles from '../../styles/orderId.styles';

interface TempReading {
  location: string;
  icon: string;
  temp: number;
  humidity?: number;
  targetMin: number;
  targetMax: number;
  time: string;
  ok: boolean;
}

function generateIoTData(events: TrackingEvent[]): TempReading[] {
  return events
    .filter(evt => evt.temperature !== undefined)
    .map(evt => ({
      location: evt.location.split(',')[0],
      icon: evt.icon,
      temp: evt.temperature!,
      humidity: evt.humidity,
      targetMin: 2,
      targetMax: 8,
      time: evt.timestamp.split(',')[0] || evt.timestamp,
      ok: evt.temperature! <= 8 && evt.temperature! >= 2,
    }));
}

export default function TrackingDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [notificationsActive, setNotificationsActive] = useState(false);

  useEffect(() => {
    if (orderId) setOrder(getOrCreateOrder(decodeURIComponent(orderId)));
  }, [orderId]);

  const handleNotifications = async () => {
    if (notificationsActive) { Alert.alert('Benachrichtigungen', 'Benachrichtigungen sind bereits aktiv.'); return; }
    if (!order) return;
    const success = await scheduleDeliveryNotifications(order.orderId, order.productName, order.retailer);
    if (success) {
      setNotificationsActive(true);
      Alert.alert('✅ Benachrichtigungen aktiviert', 'Du wirst über Statusänderungen informiert. In ~30 Sek. kommt ein Demo-Update.');
    } else {
      Alert.alert('Kein Zugriff', 'Bitte erlaube Benachrichtigungen in den App-Einstellungen.');
    }
  };

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>📦</Text>
        <Text style={styles.errorTitle}>Bestellung nicht gefunden</Text>
        <Text style={styles.errorText}>ID: {orderId}</Text>
      </View>
    );
  }

  const activeIndex = order.events.findIndex((e) => e.status === 'active');
  const activeEvent = order.events[activeIndex];
  const iotReadings = generateIoTData(order.events);

  const supplySteps = [
    { emoji: '🌱', title: 'Rohstoffe', desc: 'Weltweit' },
    { emoji: '🏭', title: 'Produktion', desc: 'Verarbeitung' },
    { emoji: '🏪', title: order.retailer, desc: 'Händler' },
    { emoji: '🏠', title: 'Du', desc: 'Zuhause' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#006EB7', '#004B87']} style={styles.header}>
        <View style={styles.retailerRow}>
          <Text style={styles.retailerLogo}>{order.retailerLogo}</Text>
          <View>
            <Text style={styles.retailerName}>{order.retailer} Online</Text>
            <Text style={styles.orderId}>#{order.orderId}</Text>
          </View>
        </View>
        <Text style={styles.productName}>{order.productName}</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{order.currentStatus}</Text>
        </View>
        <View style={styles.deliveryRow}>
          <Ionicons name="calendar-outline" size={16} color="#E0F2FE" />
          <Text style={styles.deliveryText}>Lieferung: {order.estimatedDelivery}</Text>
        </View>
      </LinearGradient>

      {/* Live Status */}
      {activeEvent && (
        <View style={styles.liveCard}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveLabel}>LIVE STATUS</Text>
          </View>
          <Text style={styles.liveTitle}>{activeEvent.title}</Text>
          <Text style={styles.liveDescription}>{activeEvent.description}</Text>
          <View style={styles.liveLocationRow}>
            <Ionicons name="location-outline" size={14} color="#006EB7" />
            <Text style={styles.liveLocation}>{activeEvent.location}</Text>
          </View>
        </View>
      )}

      {/* Map Button */}
      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => router.push({ pathname: '/liveMap', params: { orderId: order.orderId } })}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#006EB7', '#004B87']} style={styles.mapButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.mapButtonLeft}>
            <Text style={styles.mapButtonEmoji}>🗺️</Text>
            <View>
              <Text style={styles.mapButtonTitle}>Live auf Karte verfolgen</Text>
              <Text style={styles.mapButtonSubtitle}>Aktuellen Standort des Pakets anzeigen</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#BAE6FD" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((activeIndex + 1) / order.events.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{activeIndex + 1} von {order.events.length} Schritten</Text>
      </View>

      {/* Timeline */}
      <View style={styles.timeline}>
        <Text style={styles.timelineTitle}>📍 Lieferverlauf</Text>
        {order.events.map((event, index) => (
          <TrackingTimelineItem key={event.id} event={event} isLast={index === order.events.length - 1} />
        ))}
      </View>

      {/* IoT */}
      <View style={styles.iotSection}>
        <Text style={styles.iotTitle}>🌡️ Kühlketten-Monitor (IoT)</Text>
        <Text style={styles.iotSubtitle}>Echtzeit-Sensordaten aus dem Transportbehälter</Text>
        {iotReadings.map((r, i) => (
          <IoTReadingCard key={i} {...r} />
        ))}
      </View>

      {/* Supply Chain */}
      <View style={styles.supplySection}>
        <Text style={styles.supplySectionTitle}>🌍 Lieferkette</Text>
        <Text style={styles.supplySectionSubtitle}>Bevor dein Produkt zu dir kommt, reist es durch mehrere Stationen.</Text>
        <SupplyChainRow steps={supplySteps} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, notificationsActive && styles.actionBtnActive]}
          onPress={handleNotifications}
        >
          <Ionicons name={notificationsActive ? 'notifications' : 'notifications-outline'} size={20} color="#006EB7" />
          <View style={styles.actionTextBlock}>
            <Text style={styles.actionText}>
              {notificationsActive ? 'Benachrichtigungen aktiv ✓' : 'Benachrichtigungen aktivieren'}
            </Text>
            {!notificationsActive && <Text style={styles.actionSubtext}>Werde über Statusänderungen informiert</Text>}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapActionBtn}
          onPress={() => router.push({ pathname: '/liveMap', params: { orderId: order.orderId } })}
        >
          <Ionicons name="map-outline" size={20} color="#006EB7" />
          <Text style={[styles.actionText, { color: '#006EB7' }]}>Auf Karte anzeigen</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
