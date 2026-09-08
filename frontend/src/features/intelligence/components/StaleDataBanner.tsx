/**
 * Stale Data Banner Component
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 35: Stale Data UI & Manual Refresh Action
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../../theme';
import { IntelligenceFormatters } from '../formatters/intelligenceFormatters';

interface StaleDataBannerProps {
  observedAt?: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const StaleDataBanner: React.FC<StaleDataBannerProps> = ({
  observedAt,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <View style={styles.banner}>
      <View style={styles.iconContainer}>
        <Ionicons name="time-outline" size={18} color={colors.warning} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Data Exceeds Freshness Window</Text>
        <Text style={styles.subtitle}>
          Showing last valid snapshot • {IntelligenceFormatters.formatRelativeTime(observedAt)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={onRefresh}
        disabled={isRefreshing}
        activeOpacity={0.8}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color={colors.primaryDark} />
        ) : (
          <>
            <Ionicons name="refresh" size={14} color={colors.primaryDark} />
            <Text style={styles.refreshText}>Refresh</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningTint,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    borderWidth: 1,
    borderColor: colors.warning,
    gap: 8,
  },
  iconContainer: {
    padding: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.captionBold,
    color: colors.warning,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshText: {
    ...typography.captionBold,
    color: colors.primaryDark,
    fontSize: 11,
  },
});
