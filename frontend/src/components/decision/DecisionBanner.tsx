import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { DepartureState } from '../../types';

interface DecisionBannerProps {
  departureState: DepartureState;
  delayMinutes: number;
  revisedDepartureTime: string;
  gateNotice?: string;
}

export const DecisionBanner: React.FC<DecisionBannerProps> = ({
  departureState,
  delayMinutes,
  revisedDepartureTime,
  gateNotice = 'Live sync from Mandi Operator counter 4',
}) => {
  const isWait = departureState === 'WAIT' || departureState === 'DELAYED';
  const isReady = departureState === 'GET_READY';
  const isLeave = departureState === 'LEAVE_NOW' || departureState === 'ARRIVED';

  const getTheme = () => {
    if (isWait) {
      return {
        bg: colors.warningTint,
        border: colors.warning,
        badgeBg: colors.card,
        badgeText: colors.warning,
        title: 'WAIT AT HOME',
        icon: 'hourglass-outline' as keyof typeof Ionicons.glyphMap,
        body: `The mandi is delayed by ${delayMinutes} minutes. Leave at ${revisedDepartureTime}.`,
      };
    } else if (isReady) {
      return {
        bg: colors.infoTint,
        border: colors.info,
        badgeBg: colors.card,
        badgeText: colors.info,
        title: 'GET READY',
        icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
        body: `Your turn is coming soon. Prepare your vehicle and crop. Leave at ${revisedDepartureTime}.`,
      };
    } else {
      return {
        bg: colors.successTint,
        border: colors.success,
        badgeBg: colors.card,
        badgeText: colors.success,
        title: departureState === 'ARRIVED' ? 'GO TO GATE 2' : 'LEAVE NOW',
        icon: 'navigate-circle-outline' as keyof typeof Ionicons.glyphMap,
        body: departureState === 'ARRIVED'
          ? 'Show your token at Gate 2 for weighing.'
          : 'The gate is ready. Leave for Taraori Mandi now.',
      };
    }
  };

  const theme = getTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.mainContent}>
        {/* Status Pill Bar */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: theme.badgeBg }]}>
            <View style={[styles.pulseDot, { backgroundColor: theme.badgeText }]} />
            <Text style={[styles.statusBadgeText, { color: theme.badgeText }]}>
              Updated just now
            </Text>
          </View>
          <View style={styles.liveNotice}>
            <Ionicons name="radio" size={13} color={colors.textSecondary} />
            <Text style={styles.liveNoticeText}>Gate 2 live</Text>
          </View>
        </View>

        {/* Announcement Headline */}
        <View style={styles.headlineRow}>
          <Ionicons name={theme.icon} size={22} color={theme.badgeText} style={styles.headlineIcon} />
          <Text style={styles.headlineText}>{theme.title}</Text>
        </View>

        {/* Descriptive Body */}
        <Text style={styles.bodyText}>{theme.body}</Text>

      </View>

      {/* Operator Live Sync Footer */}
      <View style={styles.footerRow}>
        <View style={styles.syncRow}>
          <Ionicons name="cloud-done-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.footerText}>{gateNotice}</Text>
        </View>
        <Text style={styles.footerTime}>Live sync</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  mainContent: {
    padding: spacing.spaceMd,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.spaceXs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    ...shadows.sm,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeText: {
    ...typography.badgeLabel,
    letterSpacing: 0.5,
  },
  liveNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  headlineIcon: {
    marginTop: -2,
  },
  headlineText: {
    ...typography.headlineXl,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    flexShrink: 1,
  },
  bodyText: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.spaceMd,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerTime: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
});
