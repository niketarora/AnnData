import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { DepartureState } from '../../types';

interface DecisionBannerProps {
  departureState: DepartureState;
  delayMinutes: number;
  revisedDepartureTime: string;
  gateNotice?: string;
  onStateChange?: (state: DepartureState) => void;
  showSimulator?: boolean;
}

export const DecisionBanner: React.FC<DecisionBannerProps> = ({
  departureState,
  delayMinutes,
  revisedDepartureTime,
  gateNotice = 'Live sync from Mandi Operator counter 4',
  onStateChange,
  showSimulator = true,
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
        title: 'WAIT — Do Not Leave Yet',
        icon: 'hourglass-outline' as keyof typeof Ionicons.glyphMap,
        body: `Mandi unloading queue is delayed by ~${delayMinutes} min. Do not leave your farm yet. Next departure ETA: ${revisedDepartureTime}.`,
      };
    } else if (isReady) {
      return {
        bg: colors.infoTint,
        border: colors.info,
        badgeBg: colors.card,
        badgeText: colors.info,
        title: 'GET READY — Prepare Carrier',
        icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
        body: `Your slot begins in ~20 mins. Hitch tractor trolley and secure grain cover. Target departure: ${revisedDepartureTime}.`,
      };
    } else {
      return {
        bg: colors.successTint,
        border: colors.success,
        badgeBg: colors.card,
        badgeText: colors.success,
        title: 'LEAVE NOW — Gate Express Open',
        icon: 'navigate-circle-outline' as keyof typeof Ionicons.glyphMap,
        body: `Gate queue is clear. Depart now for Taraori Mandi Gate 2 Express Line (~35 min transit).`,
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
              ACTION: {departureState.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.liveNotice}>
            <Ionicons name="radio" size={13} color={colors.textSecondary} />
            <Text style={styles.liveNoticeText}>Gate 4 Live</Text>
          </View>
        </View>

        {/* Announcement Headline */}
        <View style={styles.headlineRow}>
          <Ionicons name={theme.icon} size={22} color={theme.badgeText} style={styles.headlineIcon} />
          <Text style={styles.headlineText}>{theme.title}</Text>
        </View>

        {/* Descriptive Body */}
        <Text style={styles.bodyText}>{theme.body}</Text>

        {/* Simulation switcher for testing states */}
        {showSimulator && onStateChange && (
          <View style={styles.simBar}>
            <TouchableOpacity
              style={[styles.simButton, isWait && styles.simButtonActiveWait]}
              onPress={() => onStateChange('WAIT')}
            >
              <Text style={[styles.simButtonText, isWait && styles.simButtonTextActive]}>
                WAIT (Farm)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.simButton, isReady && styles.simButtonActiveReady]}
              onPress={() => onStateChange('GET_READY')}
            >
              <Text style={[styles.simButtonText, isReady && styles.simButtonTextActive]}>
                GET READY
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.simButton, isLeave && styles.simButtonActiveLeave]}
              onPress={() => onStateChange('LEAVE_NOW')}
            >
              <Text style={[styles.simButtonText, isLeave && styles.simButtonTextActive]}>
                LEAVE NOW
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    ...typography.headlineMd,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  bodyText: {
    ...typography.bodyBase,
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: 2,
  },
  simBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radius.md,
    padding: 3,
    marginTop: spacing.spaceMd,
    gap: 4,
  },
  simButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  simButtonActiveWait: {
    backgroundColor: colors.warning,
  },
  simButtonActiveReady: {
    backgroundColor: colors.info,
  },
  simButtonActiveLeave: {
    backgroundColor: colors.primaryLight,
  },
  simButtonText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  simButtonTextActive: {
    color: colors.onPrimary,
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
