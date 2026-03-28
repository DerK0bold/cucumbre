import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { getPantryItems, removeFromPantry, PantryItem } from '../../services/pantryService';
import { GradientHeader } from '../../components/atoms/GradientHeader';
import { EmptyState } from '../../components/atoms/EmptyState';
import { PantryItemCard } from '../../components/molecules/PantryItemCard';
import styles from '../../styles/pantry.styles';

export default function PantryScreen() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPantry = async () => {
    setLoading(true);
    const data = await getPantryItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { loadPantry(); }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Löschen', 'Produkt aus dem Vorratsschrank entfernen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => { await removeFromPantry(id); loadPantry(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Mein Vorratsschrank"
        subtitle={`${items.length} Produkte werden überwacht`}
        style={styles.header}
      />

      {items.length === 0 && !loading ? (
        <EmptyState
          iconName="archive-outline"
          title="Dein Schrank ist leer"
          text="Scanne Produkte und lege sie hier ab, um die Haltbarkeit zu tracken."
        />
      ) : (
        <FlatList
          data={items}
          renderItem={({ item }) => <PantryItemCard item={item} onDelete={handleDelete} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadPantry}
        />
      )}
    </View>
  );
}
