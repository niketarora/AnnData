import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Clock,
  Tag,
  CreditCard,
  Info,
  CheckCheck,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react-native';
import { useAppStore } from '../../store';
import { mockStore } from '../../store/mockStore';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { EmptyState } from '../../components/feedback/EmptyState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export const NotificationsScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const state = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'QUEUE' | 'OFFER' | 'PAYMENT'>('ALL');

  const notifications = state.notifications.filter((n) => {
    if (selectedFilter === 'ALL') return true;
    return n.category === selectedFilter;
  });

  const handleNotificationPress = (item: any) => {
    mockStore.markNotificationAsRead(item.id);
    if (item.actionRoute) {
      try {
        navigation.navigate(item.actionRoute);
      } catch (e) {
        // Fallback
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'QUEUE':
        return <Clock size={18} color="#D97706" />;
      case 'OFFER':
        return <Tag size={18} color={colors.primary} />;
      case 'PAYMENT':
        return <CreditCard size={18} color={colors.success} />;
      default:
        return <Info size={18} color="#0284C7" />;
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        subtitle="Live Queue, Offer & Payment Updates"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'check-check',
          onPress: () => mockStore.markAllNotificationsAsRead(),
        }}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['ALL', 'QUEUE', 'OFFER', 'PAYMENT'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              selectedFilter === tab && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(tab)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === tab && styles.filterTabTextActive,
              ]}
            >
              {tab === 'ALL' ? 'All Updates' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <EmptyState
            title="No Notifications"
            description="You are all caught up! New queue alerts and buyer offers will appear here."
            icon="bell"
          />
        ) : (
          notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.notifCard, !item.read && styles.notifCardUnread]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.75}
            >
              <View style={styles.iconBox}>{getCategoryIcon(item.category)}</View>

              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.notifMessage}>{item.message}</Text>

                <View style={styles.notifFooter}>
                  <Text style={styles.notifTime}>{item.timestamp}</Text>
                  {item.badge && (
                    <View style={styles.badgeBox}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
              </View>

              <ChevronRight size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundLight,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.surface,
    fontFamily: typography.fontFamilies.bold,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
    ...shadows.sm,
  },
  notifCardUnread: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notifMessage: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  notifFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  notifTime: {
    fontSize: 11,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
  },
  badgeBox: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primaryDark,
  },
});
