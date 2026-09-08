import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppStore } from '../../store';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  showRoleToggle?: boolean;
  rightAction?: {
    icon?: string;
    onPress: () => void;
  };
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  onNotificationPress,
  onProfilePress,
  showRoleToggle = true,
  rightAction,
}) => {
  const [state, store] = useAppStore();
  const unreadNotifs = state.notifications.filter(
    (n) => !n.read && (n.recipientRole === state.currentRole || n.recipientRole === 'ALL')
  ).length;

  const toggleRole = () => {
    store.setRole(state.currentRole === 'FARMER' ? 'BUYER' : 'FARMER');
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="leaf" size={20} color={colors.primaryLight} />
            </View>
            <View>
              <Text style={styles.logoText}>AgriMandi</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={12} color={colors.primaryLight} />
                <Text style={styles.locationText}>
                  {state.currentRole === 'FARMER' ? state.farmer.mandiRegion : state.buyer.marketName}
                </Text>
              </View>
            </View>
          </View>
        )}

        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.rightContainer}>
        {showRoleToggle && (
          <TouchableOpacity
            style={[
              styles.roleBadge,
              state.currentRole === 'FARMER' ? styles.roleBadgeFarmer : styles.roleBadgeBuyer,
            ]}
            onPress={toggleRole}
            activeOpacity={0.8}
            accessibilityLabel={`Current role is ${state.currentRole}. Tap to switch.`}
          >
            <Ionicons
              name={state.currentRole === 'FARMER' ? 'person' : 'business'}
              size={13}
              color={state.currentRole === 'FARMER' ? colors.primaryLight : colors.info}
            />
            <Text
              style={[
                styles.roleBadgeText,
                { color: state.currentRole === 'FARMER' ? colors.primaryLight : colors.info },
              ]}
            >
              {state.currentRole === 'FARMER' ? 'KISAN' : 'BUYER'}
            </Text>
          </TouchableOpacity>
        )}

        {rightAction && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={rightAction.onPress}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={20} color={colors.primaryLight} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          {unreadNotifs > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
          accessibilityLabel="User Profile"
          accessibilityRole="button"
        >
          <Image
            source={{
              uri:
                state.currentRole === 'FARMER'
                  ? state.farmer.avatarUrl
                  : state.buyer.avatarUrl,
            }}
            style={styles.avatarImage as any}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutterMobile,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.spaceXs,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceXs,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    ...typography.titleCard,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  locationText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  titleContainer: {
    marginLeft: spacing.spaceXs,
    flex: 1,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceXs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  roleBadgeFarmer: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryLight,
  },
  roleBadgeBuyer: {
    backgroundColor: colors.infoTint,
    borderColor: colors.info,
  },
  roleBadgeText: {
    ...typography.badgeLabel,
    fontSize: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
