import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotionCard } from '../../src/components/MotionCard';
import { MotionButton } from '../../src/components/MotionButton';
import { colors, spacing, radius } from '../../src/lib/theme';

const { width } = Dimensions.get('window');

interface Circle {
  id: string;
  name: string;
  memberCount: number;
  avatarColors: string[];
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  type: 'workout' | 'achievement' | 'milestone';
  content: string;
  timestamp: string;
  cheers: number;
  hasCheered: boolean;
}

const mockCircles: Circle[] = [
  { id: '1', name: 'Gym Bros', memberCount: 8, avatarColors: ['#1E90FF', '#00FF7F', '#FF6B35'] },
  { id: '2', name: 'Morning Warriors', memberCount: 12, avatarColors: ['#FF6B35', '#1E90FF', '#00FF7F'] },
  { id: '3', name: 'Form Check', memberCount: 5, avatarColors: ['#00FF7F', '#FF6B35', '#1E90FF'] },
];

const mockPosts: Post[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'Alex M.',
    type: 'workout',
    content: 'Just crushed leg day! 🦵 New PR on squats - 140kg x 5!',
    timestamp: '2h ago',
    cheers: 12,
    hasCheered: false,
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'Sarah K.',
    type: 'achievement',
    content: 'Hit my 30-day streak! Consistency is key 🔥',
    timestamp: '4h ago',
    cheers: 24,
    hasCheered: true,
  },
  {
    id: '3',
    userId: 'u3',
    userName: 'Mike R.',
    type: 'milestone',
    content: 'Lost 10kg in 3 months! The Coach feature has been game-changing.',
    timestamp: '6h ago',
    cheers: 47,
    hasCheered: false,
  },
];

export default function SocialScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState(mockPosts);

  const handleCheer = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          cheers: post.hasCheered ? post.cheers - 1 : post.cheers + 1,
          hasCheered: !post.hasCheered,
        };
      }
      return post;
    }));
  };

  const renderCircle = ({ item }: { item: Circle }) => (
    <Pressable style={styles.circleCard}>
      <View style={styles.circleAvatars}>
        {item.avatarColors.map((color, index) => (
          <View
            key={index}
            style={[
              styles.circleAvatar,
              { backgroundColor: color, marginLeft: index > 0 ? -12 : 0, zIndex: 3 - index },
            ]}
          />
        ))}
      </View>
      <Text style={styles.circleName}>{item.name}</Text>
      <Text style={styles.circleMembers}>{item.memberCount} members</Text>
    </Pressable>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <MotionCard style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarText}>{item.userName[0]}</Text>
        </View>
        <View style={styles.postUserInfo}>
          <Text style={styles.postUserName}>{item.userName}</Text>
          <Text style={styles.postTimestamp}>{item.timestamp}</Text>
        </View>
        <View style={styles.postTypeBadge}>
          <Icon
            name={
              item.type === 'workout' ? 'dumbbell' :
              item.type === 'achievement' ? 'trophy' : 'flag-checkered'
            }
            size={14}
            color={colors.primaryGreen}
          />
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <Pressable
          style={styles.cheerButton}
          onPress={() => handleCheer(item.id)}
        >
          <Icon
            name={item.hasCheered ? 'hand-clap' : 'hand-clap'}
            size={20}
            color={item.hasCheered ? colors.primaryGreen : colors.textSecondary}
          />
          <Text
            style={[
              styles.cheerCount,
              item.hasCheered && styles.cheerCountActive,
            ]}
          >
            {item.cheers}
          </Text>
        </Pressable>
        <Pressable style={styles.commentButton}>
          <Icon name="comment-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
    </MotionCard>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Circles Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Circles</Text>
        <Pressable>
          <Text style={styles.seeAllText}>See All</Text>
        </Pressable>
      </View>
      <FlatList
        data={mockCircles}
        renderItem={renderCircle}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.circlesContainer}
      />

      {/* Create Circle Button */}
      <MotionButton
        label="Create New Circle"
        variant="secondary"
        icon={<Icon name="plus" size={20} color={colors.primary} />}
        style={styles.createCircleButton}
      />

      {/* Leaderboard Preview */}
      <MotionCard style={styles.leaderboardCard}>
        <View style={styles.leaderboardHeader}>
          <Icon name="trophy" size={24} color={colors.accent} />
          <Text style={styles.leaderboardTitle}>Weekly Leaderboard</Text>
        </View>
        <View style={styles.leaderboardRow}>
          <Text style={styles.leaderboardRank}>1</Text>
          <View style={styles.leaderboardAvatar}>
            <Text style={styles.leaderboardAvatarText}>S</Text>
          </View>
          <Text style={styles.leaderboardName}>Sarah K.</Text>
          <Text style={styles.leaderboardScore}>2,450 pts</Text>
        </View>
        <View style={styles.leaderboardRow}>
          <Text style={styles.leaderboardRank}>2</Text>
          <View style={[styles.leaderboardAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.leaderboardAvatarText}>Y</Text>
          </View>
          <Text style={styles.leaderboardName}>You</Text>
          <Text style={styles.leaderboardScore}>2,180 pts</Text>
        </View>
        <View style={styles.leaderboardRow}>
          <Text style={styles.leaderboardRank}>3</Text>
          <View style={[styles.leaderboardAvatar, { backgroundColor: colors.accent }]}>
            <Text style={styles.leaderboardAvatarText}>M</Text>
          </View>
          <Text style={styles.leaderboardName}>Mike R.</Text>
          <Text style={styles.leaderboardScore}>1,920 pts</Text>
        </View>
      </MotionCard>

      {/* Activity Feed */}
      <Text style={styles.sectionTitle}>Activity Feed</Text>
      {posts.map((post) => (
        <View key={post.id}>{renderPost({ item: post })}</View>
      ))}

      {/* Share Workout CTA */}
      <MotionCard variant="glow" style={styles.shareCard}>
        <Text style={styles.shareTitle}>Share Your Progress</Text>
        <Text style={styles.shareDescription}>
          Inspire your circles by sharing your latest workout or milestone!
        </Text>
        <MotionButton
          label="Share Update"
          variant="gradient"
          icon={<Icon name="share" size={20} color={colors.charcoal} />}
        />
      </MotionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  circlesContainer: {
    paddingRight: spacing.lg,
  },
  circleCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 140,
    alignItems: 'center',
  },
  circleAvatars: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  circleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.card,
  },
  circleName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  circleMembers: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  createCircleButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  leaderboardCard: {
    marginBottom: spacing.xl,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  leaderboardRank: {
    width: 24,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  leaderboardAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  leaderboardScore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  postCard: {
    marginBottom: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  postUserInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  postTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  postTypeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContent: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    paddingTop: spacing.sm,
  },
  cheerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  cheerCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  cheerCountActive: {
    color: colors.primaryGreen,
    fontWeight: '600',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareCard: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  shareDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
