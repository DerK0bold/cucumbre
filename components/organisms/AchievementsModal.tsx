import { View, Text, ScrollView, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GamificationData, ALL_ACHIEVEMENTS, TOTAL_ACHIEVEMENTS } from '../../services/gamification';

interface Props {
  visible: boolean;
  userData: GamificationData | null;
  onClose: () => void;
}

export function AchievementsModal({ visible, userData, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.inner}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>
              🏅 Errungenschaften ({userData?.achievements.length ?? 0}/{TOTAL_ACHIEVEMENTS})
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.grid}>
            {ALL_ACHIEVEMENTS.map((ach) => {
              const unlocked = userData?.achievements.find((a) => a.id === ach.id);
              return (
                <View
                  key={ach.id}
                  style={[
                    styles.card,
                    !unlocked && styles.cardLocked,
                    { width: '30%', flexGrow: 1, minWidth: 90 },
                  ]}
                >
                  <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>
                    {unlocked ? ach.emoji : '🔒'}
                  </Text>
                  <Text style={[styles.cardTitle, !unlocked && styles.cardTitleLocked]}>
                    {ach.title}
                  </Text>
                  <Text style={[styles.desc, !unlocked && styles.descLocked]}>
                    {ach.description}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  inner: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#006EB7',
  },
  cardLocked: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  emoji: { fontSize: 28, marginBottom: 6 },
  emojiLocked: { opacity: 0.3 },
  cardTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginBottom: 3, color: '#1E293B' },
  cardTitleLocked: { color: '#CBD5E1' },
  desc: { fontSize: 10, textAlign: 'center', lineHeight: 14, color: '#64748B' },
  descLocked: { color: '#CBD5E1' },
});
