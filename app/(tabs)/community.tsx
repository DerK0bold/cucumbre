import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  getGamificationData, GamificationData, getTrustScore,
  getLevel, TOTAL_ACHIEVEMENTS,
} from '../../services/gamification';
import { AchievementsModal } from '../../components/organisms/AchievementsModal';
import styles from '../../styles/community.styles';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  scans: number;
  level: string;
  isMe?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: '1', name: 'Lukas S.', avatar: '🧑‍💻', points: 1450, scans: 42, level: 'Experte' },
  { id: '2', name: 'Sarah M.', avatar: '👩‍🌾', points: 1280, scans: 38, level: 'Experte' },
  { id: '3', name: 'Marc B.', avatar: '👨‍🚀', points: 950, scans: 25, level: 'Fortgeschritten' },
  { id: '4', name: 'Elena K.', avatar: '👩‍🔬', points: 820, scans: 22, level: 'Fortgeschritten' },
  { id: '5', name: 'Thomas P.', avatar: '👨‍🎨', points: 610, scans: 15, level: 'Fortgeschritten' },
];

const RANK_MEDALS: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };
const RANK_COLORS = ['#F59E0B', '#94A3B8', '#CD7F32'];

export default function CommunityScreen() {
  const [userData, setUserData] = useState<GamificationData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    const data = await getGamificationData();
    setUserData(data);
    const score = getTrustScore(data);
    const lvl = getLevel(score);
    const me: LeaderboardUser = {
      id: 'me', name: 'Du', avatar: '🥑',
      points: score * 10, scans: data.totalScans, level: lvl.label, isMe: true,
    };
    setLeaderboard([...MOCK_LEADERBOARD, me].sort((a, b) => b.points - a.points));
  };

  const trustScore = userData ? getTrustScore(userData) : 0;
  const level = getLevel(trustScore);
  const myRank = leaderboard.findIndex((u) => u.isMe) + 1;

  const renderLeaderItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    const isTop3 = index < 3;
    return (
      <View style={[styles.leaderItem, item.isMe && styles.leaderItemMe]}>
        <View style={styles.rankCol}>
          {isTop3
            ? <Text style={styles.medalText}>{RANK_MEDALS[index]}</Text>
            : <Text style={[styles.rankText, item.isMe && styles.rankTextMe]}>#{index + 1}</Text>
          }
        </View>
        <View style={[styles.avatar, isTop3 && { borderColor: RANK_COLORS[index] }]}>
          <Text style={styles.avatarEmoji}>{item.avatar}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, item.isMe && styles.userNameMe]}>{item.name}</Text>
          <Text style={styles.userDetails}>{item.level} · {item.scans} Scans</Text>
        </View>
        <View style={[styles.pointsBox, item.isMe && styles.pointsBoxMe, isTop3 && { borderColor: RANK_COLORS[index] }]}>
          <Text style={[styles.pointsValue, item.isMe && { color: '#006EB7' }, isTop3 && { color: RANK_COLORS[index] }]}>
            {item.points}
          </Text>
          <Text style={styles.pointsLabel}>Pkt.</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={renderLeaderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <>
            <LinearGradient colors={['#006EB7', '#004B87']} style={styles.gradientHeader}>
              <Text style={styles.gradientTitle}>Community</Text>
              <Text style={styles.gradientSubtitle}>Dein Fortschritt auf einen Blick</Text>
              <View style={styles.levelCard}>
                <View style={styles.levelLeft}>
                  <Text style={{ fontSize: 36 }}>{level.emoji}</Text>
                  <View>
                    <Text style={styles.levelLabel}>{level.label}</Text>
                    <Text style={styles.levelScore}>Trust Score {trustScore}/100</Text>
                  </View>
                </View>
                {myRank > 0 && (
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>Rang #{myRank}</Text>
                  </View>
                )}
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressFill, { width: `${trustScore}%`, backgroundColor: level.color }]} />
              </View>
            </LinearGradient>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#4ADE80" />
                <Text style={[styles.statValue, { color: '#4ADE80' }]}>{trustScore}</Text>
                <Text style={styles.statLabel}>Trust Score</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="barcode-outline" size={20} color="#60A5FA" />
                <Text style={[styles.statValue, { color: '#60A5FA' }]}>{userData?.totalScans ?? 0}</Text>
                <Text style={styles.statLabel}>Scans</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                  {userData?.achievements.length ?? 0}/{TOTAL_ACHIEVEMENTS}
                </Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.achievementsBtn} onPress={() => setShowAchievements(true)} activeOpacity={0.8}>
              <Ionicons name="trophy-outline" size={18} color="#006EB7" />
              <Text style={styles.achievementsBtnText}>
                Errungenschaften ansehen ({userData?.achievements.length ?? 0}/{TOTAL_ACHIEVEMENTS})
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#006EB7" />
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏆 Bestenliste</Text>
              <Text style={styles.sectionDate}>März 2026</Text>
            </View>
          </>
        }
      />

      <AchievementsModal
        visible={showAchievements}
        userData={userData}
        onClose={() => setShowAchievements(false)}
      />
    </View>
  );
}
