import { useState, useCallback } from 'react';
import { View, FlatList, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory, clearHistory, ScanHistoryItem } from '../../services/scanHistory';
import { EmptyState } from '../../components/atoms/EmptyState';
import { ProductHistoryCard } from '../../components/molecules/ProductHistoryCard';
import styles from '../../styles/history.styles';
import { Text, TouchableOpacity } from 'react-native';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Minuten`;
  if (diffHours < 24) return `vor ${diffHours} Stunden`;
  return date.toLocaleDateString('de-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadData = async () => { setHistory(await getHistory()); };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const handleClear = () => {
    Alert.alert('Verlauf löschen', 'Möchtest du deinen gesamten Scan-Verlauf löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => { await clearHistory(); setHistory([]); } },
    ]);
  };

  if (history.length === 0) {
    return (
      <View style={styles.empty}>
        <EmptyState
          emoji="📷"
          title="Noch keine Scans"
          text="Scanne ein Produkt im Scanner-Tab, um es hier zu sehen."
          actionLabel="Jetzt scannen"
          onAction={() => router.push('/')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.barcode + item.scannedAt}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#006EB7" />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.headerCount}>{history.length} gescannte Produkte</Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearText}>Löschen</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <ProductHistoryCard
            item={item}
            formattedTime={formatDate(item.scannedAt)}
            onPress={() => router.push(`/product/${item.barcode}`)}
          />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}
