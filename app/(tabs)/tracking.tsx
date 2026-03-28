import { useState, useCallback } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrCreateOrder, saveOrder } from '../../services/orderTracking';
import { GradientHeader } from '../../components/atoms/GradientHeader';
import { SectionHeader } from '../../components/atoms/SectionHeader';
import { SearchInput } from '../../components/molecules/SearchInput';
import { OrderCard } from '../../components/molecules/OrderCard';
import { RetailerChip } from '../../components/molecules/RetailerChip';
import styles from '../../styles/tracking.styles';

const HISTORY_KEY = '@foodtrace_order_history';

async function loadOrderHistory(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

async function addToOrderHistory(orderId: string): Promise<void> {
  const existing = await loadOrderHistory();
  const updated = [orderId, ...existing.filter((id) => id !== orderId)].slice(0, 10);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

const EXAMPLE_ORDERS = [
  { id: 'MIG-X7K2P9QR4', label: 'Migros Online', logo: '🛒' },
  { id: 'COOP-8B3TN1LZW', label: 'Coop', logo: '🏪' },
  { id: 'POST-994567890124', label: 'Post CH', logo: '📮' },
  { id: 'DHL-1Z999AA10123456784', label: 'DHL', logo: '📦' },
];

const RETAILERS = [
  { name: 'Migros', logo: '🛒', prefix: 'MIG-...' },
  { name: 'Coop', logo: '🏪', prefix: 'COOP-...' },
  { name: 'Post CH', logo: '📮', prefix: '98/99...' },
  { name: 'DHL', logo: '📦', prefix: 'DHL-...' },
  { name: 'Amazon', logo: '🟠', prefix: 'AMZ-...' },
  { name: 'Andere', logo: '🏷️', prefix: 'Beliebig' },
];

export default function TrackingTab() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => { loadOrderHistory().then(setRecentIds); }, [])
  );

  const handleTrack = async (orderId: string) => {
    const id = orderId.trim();
    if (!id) return;
    saveOrder(getOrCreateOrder(id));
    await addToOrderHistory(id);
    setInput('');
    router.push(`/tracking/${encodeURIComponent(id)}`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <GradientHeader
          icon="📦"
          title="Lieferung verfolgen"
          subtitle="Gib deine Bestellnummer ein – von Migros, Coop, Post, DHL oder einem anderen Anbieter."
          style={styles.hero}
        />

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Bestellnummer eingeben</Text>
          <SearchInput
            value={input}
            onChangeText={setInput}
            placeholder="z.B. MIG-X7K2P9QR4 oder 9945678..."
            onSubmit={() => handleTrack(input)}
            autoCapitalize="characters"
          />
          <Text style={styles.inputHint}>
            Die Bestellnummer findest du in der Bestätigungs-E-Mail des Händlers.
          </Text>
        </View>

        {recentIds.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Zuletzt verfolgt" />
            {recentIds.map((id) => {
              const order = getOrCreateOrder(id);
              return (
                <OrderCard
                  key={id}
                  variant="recent"
                  logo={order.retailerLogo}
                  retailer={order.retailer}
                  orderId={id}
                  status={order.currentStatus}
                  isDone={order.currentStatus === 'Zugestellt'}
                  onPress={() => handleTrack(id)}
                />
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader
            title="Beispiele ausprobieren"
            subtitle="Tippe auf eine Demo-Bestellnummer um es auszuprobieren."
          />
          {EXAMPLE_ORDERS.map((ex) => (
            <OrderCard
              key={ex.id}
              variant="example"
              logo={ex.logo}
              label={ex.label}
              orderId={ex.id}
              onPress={() => handleTrack(ex.id)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Unterstützte Anbieter" />
          <View style={styles.retailerGrid}>
            {RETAILERS.map((r) => (
              <RetailerChip key={r.name} logo={r.logo} name={r.name} prefix={r.prefix} />
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
